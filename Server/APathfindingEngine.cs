using System.Collections.Generic;

namespace Server
{
    abstract class APathfindingEngine
    {
            public int[][] valueMap;
            public Agent agent;
            public List<Position> goalPos;
            public const int RIGHT = 1;
            public const int LEFT = 2;
            public const int UP = 3;
            public const int DOWN = 4;
            /* map
             * 0 = walkable path
             * 1 = wall
             * 2 = was agent - deprecated
             * 3 = starting point
             * 4 = goal
             * 5 = fixed wall (not drawable or removable from user -> outer frame)
             **/
            public APathfindingEngine(int[][] map)
            {
                goalPos = new List<Position>();
                valueMap = new int[map.Length][];
                for (int x = 0; x < map.Length; x++)
                {
                    valueMap[x] = new int[map[x].Length];
                    for (int y = 0; y < map[x].Length; y++)
                    {
                        if (map[x][y] == 1 || map[x][y] == 5)
                            valueMap[x][y] = 0;
                        else
                            valueMap[x][y] = valueMap.Length + valueMap[0].Length;

                        if (map[x][y] == 3)
                        {
                        agent = new Agent(new Position(x,y));
                    }

                        if (map[x][y] == 4)
                        {
                            goalPos.Add(new Position(x, y));
                        }
                    }
                }
            }

        public abstract string[] calculatePath();
          

        public int getBestDirection(int rightValue, int leftValue, int upValue, int downValue)
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

