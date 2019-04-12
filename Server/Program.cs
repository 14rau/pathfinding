using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Net;

namespace Server
{
    class Program
    {
        static void Main(string[] args)
        {
            Webserver webServer = new Webserver(SendResponse, "http://127.0.0.1:8080/pathfinding/");
            webServer.Run();
            Console.WriteLine("Press a key to quit.");
            Console.ReadKey();
            webServer.Stop();
        }

        public static string[] SendResponse(HttpListenerRequest request)
        {
            int[][] mapArray;

            string text;
            using (var reader = new StreamReader(request.InputStream, request.ContentEncoding))
            {
                text = reader.ReadToEnd();
            }

            var jsonObj = JObject.Parse(text);
            JArray arr = (JArray)jsonObj["data"];
            mapArray = arr.ToObject<int[][]>();
            return PathfindingApi.calculatePath(mapArray);
        }

    }
}
