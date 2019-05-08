using PathLib;
using System;
using System.Collections.Generic;
using System.Linq;

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
         **/
        public static string[] calculatePathOwn(int[][] map)
        {
            APathfindingEngine engine = new PathfindingEngine(map);
            return engine.calculatePath();
        }

        
        public static string[] calculatePathDumb(int[][] map)
        {
            APathfindingEngine engine = new DumbEngine(map);
            return engine.calculatePath();
        }
        public static string[] calculatePathRandom(int[][] map)
        {
            APathfindingEngine engine = new RandomEngine(map);
            return engine.calculatePath();
        }

        //A*
        public static string[] calculateAStar(int[][] map)
        {
            Field mapField = new Field(map);
            var positions = mapField.aStarBest(1000);
            if (positions == null) throw new Exception("No path");
            return positions.Select(i => 
            {
                return i.direction.ToString().ToLower();
            }).ToArray();
        }

        //Dijkstras path finding algo
        public static string[] calculateDijkstra(int[][] map)
        {
            Field mapField = new Field(map);
            var positions = mapField.dijkstrasBest();
            if (positions == null) throw new Exception("No path");
            return positions.Select(i =>
            {
                return i.direction.ToString().ToLower();
            }).ToArray();
        }

        //Genetic
        public static string[] calculateGeneric(int[][] map)
        {
            Field mapField = new Field(map);
            var positions = mapField.geneticFindBest(4, 300, 50);
            if (positions == null) throw new Exception("No path");
            return positions.Select(i =>
            {
                return i.direction.ToString().ToLower();
            }).ToArray();
        }
    }
}
