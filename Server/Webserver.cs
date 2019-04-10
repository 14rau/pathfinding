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
        private readonly Func<HttpListenerRequest, string[]> _responderMethod;

        public Webserver(string[] prefixes, Func<HttpListenerRequest, string[]> method)
        {
            if (!HttpListener.IsSupported)
                throw new NotSupportedException(
                    "Needs Windows XP SP2, Server 2003 or later.");

            // URI prefixes are required 
            // "http://localhost:8080/index/".
            if (prefixes == null || prefixes.Length == 0)
                throw new ArgumentException("prefixes");

            // A responder method is required
            if (method == null)
                throw new ArgumentException("method");

            foreach (string s in prefixes)
                _listener.Prefixes.Add(s);

            _responderMethod = method;
            _listener.Start();
        }

        public Webserver(Func<HttpListenerRequest, string[]> method, params string[] prefixes)
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
                                string[] responseArray = _responderMethod(context.Request);
                                JObject responseObject = new JObject();
                                responseObject.Add("data", JArray.FromObject(responseArray));
                                byte[] buffer = Encoding.UTF8.GetBytes(responseObject.ToString());
                                context.Response.ContentLength64 = buffer.Length;
                                context.Response.OutputStream.Write(buffer, 0, buffer.Length);
                            }
                            catch { } // suppress any exceptions
                            finally
                            {
                                // always close the stream
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
