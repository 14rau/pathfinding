using System;

namespace Server
{
    class Position
    {
        private readonly int x;
        private readonly int y;

        public Position(int x, int y)
        {
            this.x = x;
            this.y = y;
        }

        public int getX()
        {
            return x;
        }
        public int getY()
        {
            return y;
        }

        public Position getLeft()
        {
            return new Position(x - 1, y);
        }

        public Position getRight()
        {
            return new Position(x + 1, y);
        }

        public Position getUp()
        {
            return new Position(x, y - 1);
        }

        public Position getDown()
        {
            return new Position(x, y + 1);
        }

        public override bool Equals(object obj)
        {
            var position = obj as Position;
            return position != null &&
                   x == position.x &&
                   y == position.y;
        }

        public int getDistanceTo(Position target)
        {
           return (Math.Abs((x) - target.getX()) + Math.Abs((y) - target.getY()));
        }
    }
}
