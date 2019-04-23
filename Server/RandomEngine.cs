using System;

namespace Server
{
    class RandomEngine : APathfindingEngine
    {
        public RandomEngine(int[][] map) : base(map,new RandomAgent())
        {
        }

        public override string[] calculatePath()
        {
            while (!agent.getPosition().Equals(goalPos))
            {
                int agentPosX = agent.getPosition().getX();
                int agentPosY = agent.getPosition().getY();

                if (valueMap[agentPosX][agentPosY]++ > 100)
                    break;

                Random random = new Random(DateTime.Now.Millisecond);
                random.Next(1000);

                int left, right, up, down;

                if (agentPosX > 0)
                    left = valueMap[agentPosX - 1][agentPosY] * random.Next(1,1000); 
                else left = 0;
                if (agentPosX < valueMap.Length - 1)
                    right = valueMap[agentPosX + 1][agentPosY] * random.Next(1,1000); 
                else right = 0;
                if (agentPosY > 0)
                    up = valueMap[agentPosX][agentPosY - 1] * random.Next(1,1000); 
                else up = 0;
                if (agentPosY < valueMap[agentPosX].Length - 1)
                    down = valueMap[agentPosX][agentPosY + 1] * random.Next(1,1000);
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

            }
            return agent.getPath();
        }
    }
}
