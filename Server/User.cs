using System.Linq;

namespace Server
{
    class User
    {
        private string username;
        private byte[] _passwordSalt;
        private byte[] _passwordHash;

        public User(string username, byte[] passwordSalt, byte[] passwordHash)
        {
            this.username = username;
            _passwordSalt = passwordSalt;
            _passwordHash = passwordHash;
        }

        public string getUsername()
        {
            return username;
        }

        public bool ConfirmPassword(string password)
        {
            byte[] passwordHash = HashTools.Hash(password, _passwordSalt);

            return _passwordHash.SequenceEqual(passwordHash);
        }
    }
}
