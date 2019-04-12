using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Server
{
    class Agent
    {
        private Position position;
        private List<Position> knownPositions;
        private List<string> path;


        public Agent(Position startPosition)
        {
            this.position = startPosition;
            knownPositions = new List<Position>();
            path = new List<string>();
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
            path.Add("Right");
        }

        public void goLeft()
        {
            position = position.getLeft();
            clearUselessPathOptions();
            knownPositions.Add(position);
            path.Add("Left");
        }

        public void goUp()
        {
            position = position.getUp();
            clearUselessPathOptions();
            knownPositions.Add(position);
            path.Add("Up");
        }

        public void goDown()
        {
            position = position.getDown();
            clearUselessPathOptions();
            knownPositions.Add(position);
            path.Add("Down");
        }

        public string[] getPath()
        {
            return convertToFrontendCoordinateSystem();
        }

        private string[] convertToFrontendCoordinateSystem()
        {
            List<string> frontendMovement = new List<string>();
            foreach(string movement in path)
            {
                if (movement.Equals("Left"))
                    frontendMovement.Add("Up");
                if (movement.Equals("Right"))
                    frontendMovement.Add("Down");
                if (movement.Equals("Up"))
                    frontendMovement.Add("Left");
                if (movement.Equals("Down"))
                    frontendMovement.Add("Right");
            }
            return frontendMovement.ToArray();
        }

        private void clearUselessPathOptions()
        {
            //needs rework
            if (knownPositions.Contains(position)&&false)
            {
                int rangeStart = knownPositions.IndexOf(position);
                int objectsToRemove = knownPositions.Count() - (rangeStart);
                path.RemoveRange(rangeStart-1, objectsToRemove);
                knownPositions.RemoveRange(rangeStart, objectsToRemove);
                
            }
        }
    }
}
