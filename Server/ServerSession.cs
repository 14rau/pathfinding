using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json.Linq;

namespace Server
{
    class ServerSession
    {
        private static ServerSession instance;

        private List<User> users;
        private List<string> sessionKeys;

        public static ServerSession getInstance()
        {
            if (instance == null)
                instance = new ServerSession();
            return instance;
        }

        private ServerSession()
        {
            users = new List<User>();
            byte[] salt = HashTools.createRandomSalt() ;
            users.Add(new User("seow", salt, HashTools.Hash("seow230111", salt)));
            sessionKeys = new List<string>();
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

        internal string createNewSessionKey(string user)
        {
            string newSessionKey = user;
            if(!sessionKeys.Contains(newSessionKey))
                sessionKeys.Add(user);
            return user;
        }

        internal bool isSessionValid(string sessionKey)
        {
            foreach(string session in sessionKeys)
            {
                if (session.Equals(sessionKey))
                    return true;
            }
            return false;
        }

        internal void endSession(string sessionKey)
        {
            foreach (string session in sessionKeys)
            {
                if (session.Equals(sessionKey))
                    sessionKeys.Remove(session);
            }
        }
    }
}
