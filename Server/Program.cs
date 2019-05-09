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

            Webserver webServer = new Webserver(SendResponse, address);
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
            string[] uriSegments = request.Url.Segments;
            string endpoint = uriSegments[uriSegments.Length - 1];

            string text;
            using (var reader = new StreamReader(request.InputStream, request.ContentEncoding))
            {
                text = reader.ReadToEnd();
            }

            JObject responseJson = new JObject();
            if (text.Length == 0)
                return responseJson;
            JObject requestJson = JObject.Parse(text);

            byte[] sessionKey = new byte[0];

            switch (endpoint)
            {
                case "map/":
                    Console.WriteLine("maps were requested");
                    return createDefaultMapsObject();
                case "login/":
                    string user = (string)requestJson["user"];
                    Console.WriteLine("login attempt from: "+ user);
                    string pass = (string)requestJson["pass"];
                    if (ServerSession.getInstance().validateUser(user, pass))
                    {
                        byte[] newSessionKey = ServerSession.getInstance().createNewSessionKey(user);
                        responseJson.Add("session", newSessionKey);
                        Console.WriteLine("login successful");

                        return responseJson;
                    }
                    else
                    {
                        responseJson.Add("session", null);
                        Console.WriteLine("login failed");
                        return responseJson;
                    }
                case "logout/":
                    Console.WriteLine("logout attempt");
                    sessionKey = (byte[])requestJson["session"];
                    ServerSession.getInstance().endSession(sessionKey);
                    Console.WriteLine("logout successful");

                    return responseJson;
                case "valid/":
                    Console.WriteLine("validate session");
                    sessionKey = (byte[])requestJson["session"];
                    responseJson.Add("isValid", ServerSession.getInstance().isSessionValid(sessionKey));
                    return responseJson;
                case "save/":
                    sessionKey = (byte[])requestJson["session"];
                    validateSession(sessionKey);
                    string name = (string)requestJson["name"];
                    Console.WriteLine("Attempt to save map: " + name);

                    using (StreamWriter file = File.CreateText(Path.Combine(getDir(), name + ".json")))
                    using (JsonTextWriter writer = new JsonTextWriter(file))
                    {
                        requestJson.WriteTo(writer);
                    }
                    return responseJson;
                default:
                    Console.WriteLine("Path requested");
                    sessionKey = (byte[])requestJson["session"];

                    validateSession(sessionKey);
                    int[][] mapArray;

                    JArray arr = (JArray)requestJson["map"];

                    int algorithm = (requestJson["algorithm"] != null) ? (int)requestJson["algorithm"] : 0;

                    if (requestJson["settings"] != null)
                    {
                        JArray settings = (JArray)requestJson["settings"];
                        mapArray = applyCustomOptions(arr.ToObject<int[][]>(), settings.ToObject<int[]>());
                    }
                    else
                        mapArray = arr.ToObject<int[][]>();

                    switch (algorithm)
                    {
                        case 0:
                            responseJson.Add("data", JArray.FromObject(PathfindingApi.calculatePathRandom(mapArray)));
                            return responseJson;
                        case 1:
                            responseJson.Add("data", JArray.FromObject(PathfindingApi.calculateAStar(mapArray)));
                            return responseJson;
                        case 2:
                            responseJson.Add("data", JArray.FromObject(PathfindingApi.calculateDijkstra(mapArray)));
                            return responseJson;
                        case 3:
                            responseJson.Add("data", JArray.FromObject(PathfindingApi.calculateGeneric(mapArray)));
                            return responseJson;
                        case 4:
                            responseJson.Add("data", JArray.FromObject(PathfindingApi.calculatePathOwn(mapArray)));
                            return responseJson;
                        case 5:
                            responseJson.Add("data", JArray.FromObject(PathfindingApi.calculatePathDumb(mapArray)));
                            return responseJson;
                        default:
                            responseJson.Add("data", JArray.FromObject(PathfindingApi.calculatePathRandom(mapArray)));
                            return responseJson;

                    }
            }
        }

        private static void validateSession(byte[] sessionKey)
        {
            if (!ServerSession.getInstance().isSessionValid(sessionKey))
            {
                throw new NotSupportedException();
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
