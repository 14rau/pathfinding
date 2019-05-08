using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Server
{
    class ServerSession
    {
        private static ServerSession instance;

        private List<User> users;
        private List<byte[]> sessionKeys;

        public static ServerSession getInstance()
        {
            if (instance == null)
                instance = new ServerSession();
            return instance;
        }

        private ServerSession()
        {
            users = new List<User>();
            loadUsers();
            sessionKeys = new List<byte[]>();
        }

        private void loadUsers()
        {
            if(!File.Exists(Path.Combine(Directory.GetCurrentDirectory(), "userDB.json"))){
                createDefaultUserDB();
            }
            using (StreamReader file = File.OpenText(Path.Combine(Directory.GetCurrentDirectory(), "userDB.json")))
            using (JsonTextReader reader = new JsonTextReader(file))
            {
                JArray jUsers = (JArray)JToken.ReadFrom(reader);
                foreach(JObject jUser in jUsers)
                {
                    string jName = (string)jUser["name"];
                    byte[] jSalt = (byte[])jUser["salt"];
                    byte[] jPass = (byte[])jUser["pass"];
                    users.Add(new User(jName,jSalt, jPass));
                }

            }
        }
        private void createDefaultUserDB()
        {
            byte[] salt = HashTools.createRandomSalt();

            JArray tusers = new JArray();
            JObject seow = new JObject();
            seow.Add("name", "Seow");
            seow.Add("pass", HashTools.Hash("seow230111", salt));
            seow.Add("salt", salt);
            tusers.Add(seow);

            salt = HashTools.createRandomSalt();
            JObject patrick = new JObject();
            patrick.Add("name", "Patrick");
            patrick.Add("pass", HashTools.Hash("panda", salt));
            patrick.Add("salt", salt);
            tusers.Add(patrick);

            salt = HashTools.createRandomSalt();
            JObject artem = new JObject();
            artem.Add("name", "Artem");
            artem.Add("pass", HashTools.Hash("root", salt));
            artem.Add("salt", salt);
            tusers.Add(artem);

            salt = HashTools.createRandomSalt();
            JObject guest = new JObject();
            guest.Add("name", "Guest");
            guest.Add("pass", HashTools.Hash("guess", salt));
            guest.Add("salt", salt);
            tusers.Add(guest);


            using (StreamWriter file = File.CreateText(Path.Combine(Directory.GetCurrentDirectory(), "userDB.json")))
            using (JsonTextWriter writer = new JsonTextWriter(file))
            {
                tusers.WriteTo(writer);
            }
        }

        internal bool validateUser(string username, string pass)
        {
            foreach(User user in users)
            {
                if (user.getUsername().Equals(username))
                {
                    return user.ConfirmPassword(pass);
                }
            }
            return false;
        }

        internal byte[] createNewSessionKey(string user)
        {
            byte[] newSessionKey = HashTools.Hash(new Random(DateTime.Now.Millisecond).Next().ToString()+user,HashTools.createRandomSalt());
            if(!sessionKeys.Contains(newSessionKey))
                sessionKeys.Add(newSessionKey);
            return newSessionKey;
        }

        internal bool isSessionValid(byte[] sessionKey)
        {
            foreach(byte[] session in sessionKeys)
            {

                bool bEqual = false;
                if (sessionKey.Length == session.Length)
                {
                    int i = 0;
                    while ((i < sessionKey.Length) && (sessionKey[i] == session[i]))
                    {
                        i += 1;
                    }
                    if (i == sessionKey.Length)
                    {
                        bEqual = true;
                    }
                }

                if (bEqual)
                    return true;
            }
            return false;
        }

        internal void endSession(byte[] sessionKey)
        {
            foreach (byte[] session in sessionKeys)
            {
                if (session.Equals(sessionKey))
                    sessionKeys.Remove(session);
            }
        }
    }
}
