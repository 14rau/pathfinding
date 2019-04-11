using System;

namespace Server
{
    class PathfindingApi
    {
        /* map
         * 0 = walkable path
         * 1 = wall
         * 2 = was agent - deprecated
         * 3 = starting point
         * 4 = goal
         * 5 = fixed wall (not drawable or removable from user -> outer frame)
         **/
        public static string[] calculatePath(int[][] map)
        {
            String[] movement = { "Up", "Up", "Left" };
            return movement;
        }
    }
}
