using System;
using System.Collections.Generic;

namespace Server
{
    class RandomEngine : APathfindingEngine
    {
        public RandomEngine(int[][] map) : base(map)
        {
        }

        public override string[] calculatePath()
        {
            List<string> path = new List<string>();
            Random random = new Random(DateTime.Now.Millisecond);
            while (goalPos.Count > 0)
            {
                int agentPosX = agent.getPosition().getX();
                int agentPosY = agent.getPosition().getY();

                if (valueMap[agentPosX][agentPosY]++ > 10000)
                    break;

                int left, right, up, down;

                Position checkingPosition = agent.getPosition();
                if (!isWall(checkingPosition.getLeft()))
                    left = random.Next(1,1000); 
                else left = 0;
                if (!isWall(checkingPosition.getRight()))
                    right = random.Next(1, 1000);
                else right = 0;
                if (!isWall(checkingPosition.getUp()))
                    up = random.Next(1, 1000);
                else up = 0;
                if (!isWall(checkingPosition.getDown()))
                    down = random.Next(1, 1000);
                else down = 0;

                switch (getBestDirection(right, left, up, down))
                {
                    case RIGHT:
                        agent.goRight();
                        break;
                    case LEFT:
                        agent.goLeft();
                        break;
                    case UP:
                        agent.goUp();
                        break;
                    case DOWN:
                        agent.goDown();
                        break;
                    default:
                        break;
                }

                if (goalPos.Contains(agent.getPosition()))
                {
                    path.AddRange(agent.getPath());
                    agent.reset(agent.getPosition());
                    goalPos.Remove(agent.getPosition());
                }
            }
            return path.ToArray();
        }

        private Boolean isWall(Position pos)
        {
            if(pos.getX() <0 || pos.getY() <0|| pos.getX() > valueMap.Length - 1||pos.getY() > valueMap[0].Length - 1 )
                return true;
            return valueMap[pos.getX()][pos.getY()] == 0;
        }
    }
}
