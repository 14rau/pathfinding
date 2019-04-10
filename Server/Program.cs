using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Server
{
    class Program
    {
        static void Main(string[] args)
        {
            Webserver ws = new Webserver(SendResponse, "http://127.0.0.1:8080/");
            ws.Run();
            Console.WriteLine("A simple webserver. Press a key to quit.");
            Console.ReadKey();
            ws.Stop();
        }

        public static string[] SendResponse(HttpListenerRequest request)
        {
            int[][] mapArray;
            using (var reader = new StreamReader(request.InputStream,
                                                             request.ContentEncoding))
            {
                string text = reader.ReadToEnd();
                var jsonObj = JObject.Parse(text);
                Console.WriteLine("data : " + (JArray)jsonObj["name"]);

                JArray arr = (JArray)jsonObj["data"];
                mapArray = arr.ToObject<int[][]>();
            }
            return PathfindingApi.calculatePath(mapArray);
        }

    }
}
