using Newtonsoft.Json.Linq;
using System;
using System.Net;
using System.Text;
using System.Threading;

namespace Server
{
    class Webserver
    {
        private readonly HttpListener _listener = new HttpListener();
        private readonly Func<HttpListenerRequest, JObject> _responderMethod;

        public Webserver(string[] prefixes, Func<HttpListenerRequest, JObject> method)
        {
            if (!HttpListener.IsSupported)
                throw new NotSupportedException(
                    "Needs Windows XP SP2, Server 2003 or later.");

            if (prefixes == null || prefixes.Length == 0)
                throw new ArgumentException("prefixes");

            if (method == null)
                throw new ArgumentException("method");

            foreach (string s in prefixes)
                _listener.Prefixes.Add(s);

            _responderMethod = method;
            _listener.Start();
        }

        public Webserver(Func<HttpListenerRequest, JObject> method, params string[] prefixes)
            : this(prefixes, method) { }

        public void Run()
        {
            ThreadPool.QueueUserWorkItem((o) =>
            {
                Console.WriteLine("Webserver running...");
                try
                {
                    while (_listener.IsListening)
                    {
                        ThreadPool.QueueUserWorkItem((c) =>
                        {
                        var context = c as HttpListenerContext;
                        try
                        {
                                JObject responseObject = _responderMethod(context.Request);
                                byte[] buffer = Encoding.UTF8.GetBytes(responseObject.ToString());
                                context.Response.ContentLength64 = buffer.Length;
                                context.Response.OutputStream.Write(buffer, 0, buffer.Length);
                            }
                            catch {
                                context.Response.StatusCode = 404;
                            }
                            finally
                            {
                                context.Response.OutputStream.Close();
                            }
                        }, _listener.GetContext());
                    }
                }
                catch { } // suppress any exceptions
            });
        }

        public void Stop()
        {
            _listener.Stop();
            _listener.Close();
        }
    }
}
