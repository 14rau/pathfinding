using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Server
{
    class PathfindingEngine
    {   /* valueMap
         * 0 = unwalkable
         * 1 & >1 = weight
         **/
        private int[][] valueMap;
        private Agent agent;
        private Position goalPos;
        const int RIGHT = 1;
        const int LEFT = 2;
        const int UP = 3;
        const int DOWN = 4;
        /* map
         * 0 = walkable path
         * 1 = wall
         * 2 = was agent - deprecated
         * 3 = starting point
         * 4 = goal
         * 5 = fixed wall (not drawable or removable from user -> outer frame)
         **/
        public PathfindingEngine(int[][] map)
        {
            valueMap = new int[map.Length][];
            for(int x = 0;x<map.Length; x++)
            {
                valueMap[x] = new int[map[x].Length];
                for (int y = 0; y < map[x].Length; y++)
                {
                    if (map[x][y] == 1 || map[x][y] == 5)
                        valueMap[x][y] = 0;
                    else
                        valueMap[x][y] = 1;

                    if (map[x][y] == 3)
                    {
                        agent = new Agent(new Position(x, y));
                    }

                    if (map[x][y] == 4)
                    {
                        goalPos = new Position(x, y);
                    }
                }
            }
        }

        public string[] calculatePath()
        {
            while (!agent.getPosition().Equals(goalPos))
            {
                int agentPosX = agent.getPosition().getX();
                int agentPosY = agent.getPosition().getY();

                if (valueMap[agentPosX][agentPosY]++ > 100)
                    break;

                int left, right, up, down;

                if (agentPosX > 0)
                    left = valueMap[agentPosX - 1][agentPosY] * (Math.Abs((agentPosX-1)-goalPos.getX())+1);
                else left = 0;
                if (agentPosX < valueMap.Length - 1)
                    right = valueMap[agentPosX + 1][agentPosY] * (Math.Abs((agentPosX + 1) - goalPos.getX())+1);
                else right = 0;
                if (agentPosY > 0)
                    up = valueMap[agentPosX][agentPosY - 1] * (Math.Abs((agentPosY - 1) - goalPos.getY())+1);
                else up = 0;
                if (agentPosY < valueMap[agentPosX].Length - 1)
                    down = valueMap[agentPosX][agentPosY + 1] * (Math.Abs((agentPosY + 1) - goalPos.getY())+1);
                else down = 0;

                switch (getBestDirection(right,left,up,down))
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

        private int getBestDirection( int rightValue, int leftValue, int upValue, int downValue)
        {
            int movement = 0;
            int smallest = int.MaxValue;

            if (rightValue > 0 && rightValue < smallest)
            {
                movement = RIGHT;
                smallest = rightValue;
            }
            if (leftValue > 0 && leftValue < smallest)
            {
                movement = LEFT;
                smallest = leftValue;
            }
            if (upValue > 0 && upValue < smallest)
            {
                movement = UP;
                smallest = upValue;
            }
            if (downValue > 0 && downValue < smallest)
            {
                movement = DOWN;
                smallest = downValue;
            }
            return movement;
        }
    }
}
