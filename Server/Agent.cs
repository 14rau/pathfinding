using System.Collections.Generic;
using System.Linq;

namespace Server
{
    class Agent
    {
        private Position position;
        private List<Position> knownPositions;

        public Agent(Position startPosition)
        {
            this.position = startPosition;
            knownPositions = new List<Position>();
            knownPositions.Add(position);
        }

        public Position getPosition()
        {
            return position;
        }

        public void goRight()
        {
            position = position.getRight();
            clearUselessPathOptions();
            knownPositions.Add(position);
        }

        public void goLeft()
        {
            position = position.getLeft();
            clearUselessPathOptions();
            knownPositions.Add(position);
        }

        public void goUp()
        {
            position = position.getUp();
            clearUselessPathOptions();
            knownPositions.Add(position);
        }

        public void goDown()
        {
            position = position.getDown();
            clearUselessPathOptions();
            knownPositions.Add(position);
        }

        public string[] getPath()
        {
            return convertToFrontendCoordinateSystem();
        }

        private string[] convertToFrontendCoordinateSystem()
        {
            List<string> frontendMovement = new List<string>();
            foreach(string movement in createMovementPath())
            {
                if (movement.Equals("Left"))
                    frontendMovement.Add("up");
                if (movement.Equals("Right"))
                    frontendMovement.Add("down");
                if (movement.Equals("Up"))
                    frontendMovement.Add("left");
                if (movement.Equals("Down"))
                    frontendMovement.Add("right");
            }
            return frontendMovement.ToArray();
        }

        private void clearUselessPathOptions()
        {
            if (knownPositions.Contains(position))
            {
                knownPositions = knownPositions.GetRange(0,knownPositions.IndexOf(position));
            }
        }

        private List<string> createMovementPath()
        {
            List<string> path = new List<string>();

            for(int i=0; i < knownPositions.Count()-1; i++)
            {
                Position current = knownPositions.ElementAt(i);
                Position next = knownPositions.ElementAt(i + 1);

                if (current.getLeft().Equals(next))
                    path.Add("Left");
                if (current.getRight().Equals(next))
                    path.Add("Right");
                if (current.getUp().Equals(next))
                    path.Add("Up");
                if (current.getDown().Equals(next))
                    path.Add("Down");
            }
            return path;
        }
    }
}
