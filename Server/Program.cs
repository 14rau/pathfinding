using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Net;

namespace Server
{
    class Program
    {
        static string ip;
        static string port;
        static string address;

        static void Main(string[] args)
        {
            initSettings();

            address = "http://"+ip+":"+port+"/";

            Webserver webServer = new Webserver(SendResponse, address+"pathfinding/", address + "pathfinding/map/", address + "pathfinding/save/");
            webServer.Run();
            Console.WriteLine("Press a key to quit.");
            Console.ReadKey();
            webServer.Stop();
        }

        private static void initSettings()
        {
            string settingsPath = Path.Combine(Directory.GetCurrentDirectory(), "settings.json");
            if (!File.Exists(settingsPath))
            {
                JObject jObject = new JObject();

                jObject.Add("ip", "localhost");
                jObject.Add("port", "8080");

                using (StreamWriter file = File.CreateText(settingsPath))
                using (JsonTextWriter writer = new JsonTextWriter(file))
                {
                    jObject.WriteTo(writer);
                }
            }

            using (StreamReader file = File.OpenText(settingsPath))
            using (JsonTextReader reader = new JsonTextReader(file))
            {
                JObject settingsJson = (JObject)JToken.ReadFrom(reader);
                ip = (string)settingsJson["ip"];
                port = (string)settingsJson["port"];

            }
        }

        public static JObject SendResponse(HttpListenerRequest request)
        {

            if (request.Url.Equals(address+"pathfinding/map/"))
                return createDefaultMapsObject();

            int[][] mapArray;

            string text;
            using (var reader = new StreamReader(request.InputStream, request.ContentEncoding))
            {
                text = reader.ReadToEnd();
            }

            JObject jsonObj = JObject.Parse(text);
           
            if (request.Url.Equals(address + "pathfinding/save/"))
            {
                string name = (string)jsonObj["name"];

                using (StreamWriter file = File.CreateText(Path.Combine(getDir(),name+".json")))
                using (JsonTextWriter writer = new JsonTextWriter(file))
                {
                    jsonObj.WriteTo(writer);
                }
                return new JObject();
            }

            JArray arr = (JArray)jsonObj["map"];

            int algorithm = (jsonObj["algorithm"] != null)?(int)jsonObj["algorithm"] :0;

            if (jsonObj["settings"] != null) { 
                JArray settings = (JArray)jsonObj["settings"];
                mapArray = applyCustomOptions(arr.ToObject<int[][]>(), settings.ToObject<int[]>());
            }
            else
                mapArray = arr.ToObject<int[][]>();

            JObject responseObject = new JObject();

            switch (algorithm)
            {
                case 0:
                    responseObject.Add("data", JArray.FromObject(PathfindingApi.calculatePathRandom(mapArray)));
                    return responseObject;
                case 1:
                    responseObject.Add("data", JArray.FromObject(PathfindingApi.calculateAStar(mapArray)));
                    return responseObject;
                case 2:
                    responseObject.Add("data", JArray.FromObject(PathfindingApi.calculateDijkstra(mapArray)));
                    return responseObject;
                case 3:
                    responseObject.Add("data", JArray.FromObject(PathfindingApi.calculateGeneric(mapArray)));
                    return responseObject;
                case 4:
                    responseObject.Add("data", JArray.FromObject(PathfindingApi.calculatePathOwn(mapArray)));
                    return responseObject;
                case 5:
                    responseObject.Add("data", JArray.FromObject(PathfindingApi.calculatePathDumb(mapArray)));
                    return responseObject;
                default:
                    responseObject.Add("data", JArray.FromObject(PathfindingApi.calculatePathRandom(mapArray)));
                    return responseObject;

            }

        }

        private static JObject createDefaultMapsObject()
        {
            JObject responseObject = new JObject();
            JArray maps = new JArray();

            string[] filePaths = Directory.GetFiles(getDir());

            foreach(String filePath in filePaths)
            {
                using (StreamReader file = File.OpenText(filePath))
                using (JsonTextReader reader = new JsonTextReader(file))
                {
                    JObject o2 = (JObject)JToken.ReadFrom(reader);
                    maps.Add(o2);
                }
            }

            responseObject.Add("maps", maps);
            
            return responseObject;
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

                    else if (inputMap[x][y] == settings[1])
                        result[x][y] = 1;

                    else if (inputMap[x][y] == settings[2])
                        result[x][y] = 3;

                    else if (inputMap[x][y] == settings[3])
                        result[x][y] = 4;
                    else
                        result[x][y] = 1;

                }
            }
            return result;
        }

        private static string getDir()
        {
            string path = Path.Combine(Directory.GetCurrentDirectory(), "Maps");
            Directory.CreateDirectory(path);
            return path;
        }

    }
}
