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
            Webserver webServer = new Webserver(SendResponse, "http://localhost:8080/pathfinding/");
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
            JArray arr = (JArray)jsonObj["map"];
            int algorithm = (jsonObj["algorithm"] != null)?(int)jsonObj["algorithm"] :0;

            if (jsonObj["settings"] != null) { 
                JArray settings = (JArray)jsonObj["settings"];
                mapArray = applyCustomOptions(arr.ToObject<int[][]>(), settings.ToObject<int[]>());
            }
            else
                mapArray = arr.ToObject<int[][]>();

            switch (algorithm)
            {
                case 0:
                    return PathfindingApi.calculatePathRandom(mapArray);
                case 1:
                    return PathfindingApi.calculatePathArtem1(mapArray);
                case 2:
                    return PathfindingApi.calculatePathArtem2(mapArray);
                case 3:
                    return PathfindingApi.calculateArtem3(mapArray);
                case 4:
                    return PathfindingApi.calculatePathOwn(mapArray);
                case 5:
                    return PathfindingApi.calculatePathDumb(mapArray);
                default:
                    return PathfindingApi.calculatePathOwn(mapArray);

            }

        }

        private static int[][] applyCustomOptions(int[][] inputMap, int[] settings)
        {
            int [][] result = new int[inputMap.Length][];
            for (int x = 0; x < inputMap.Length; x++)
            {
                result[x] = new int[inputMap[x].Length];
                for (int y = 0; y < inputMap[x].Length; y++)
                {
                    if (inputMap[x][y] == settings[0])
                        result[x][y] = 0;

                    if (inputMap[x][y] == settings[1])
                        result[x][y] = 1;

                    if (inputMap[x][y] == settings[2])
                        result[x][y] = 3;

                    if (inputMap[x][y] == settings[3])
                        result[x][y] = 4;
                }
            }
            return result;
        }

    }
}
