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

            }
            return agent.getPath();
        }

        private Boolean isWall(Position pos)
        {
            if(pos.getX() <0 || pos.getY() <0|| pos.getX() > valueMap.Length - 1||pos.getY() > valueMap[0].Length - 1 )
                return true;
            return valueMap[pos.getX()][pos.getY()] == 0;
        }
    }
}
