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
        public static string[] calculatePathOwn(int[][] map)
        {
            APathfindingEngine engine = new PathfindingEngine(map);
            return engine.calculatePath();
        }

        public static string[] calculatePathRandom(int[][] map)
        {
            APathfindingEngine engine = new RandomEngine(map);
            return engine.calculatePath();
        }

        //A*
        public static string[] calculatePathArtem1(int[][] map)
        {
            APathfindingEngine engine = new RandomEngine(map);
            return engine.calculatePath();
        }

        //Das Ding mit D
        public static string[] calculatePathArtem2(int[][] map)
        {
            APathfindingEngine engine = new RandomEngine(map);
            return engine.calculatePath();
        }

        //Genetic
        public static string[] calculateArtem3(int[][] map)
        {
            APathfindingEngine engine = new RandomEngine(map);
            return engine.calculatePath();
        }
    }
}
