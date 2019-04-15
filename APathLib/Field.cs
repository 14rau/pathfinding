using System;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// Author: Artem Zheleznyakov, April 2019
/// 
/// Simple implementation of A* pathfinding algorithm with emphasis on code readability.
/// Works only with rectangular maps and supports evaluation of 'flags' (start, end, obstacle, etc.) only of type interger 
/// 
/// Disclaimer:
/// Code performance is not optimal and was not reviewed by the author.
/// May contain bugs!
/// Autor is not responsible for any damage caused by the code and etc..
/// </summary>
/// 
namespace APathLib
{
    class Field
    {
        //References
        private Flags flags;
        //YX-Map container
        private int[][] map;
        //Define start & goal squares
        private Square startSquare;
        private Square goalSquare;

        /// <summary>
        /// Initializes a new field (map) with given/default flags
        /// </summary>
        /// <param name="map">Map matrix (yx)</param>
        /// <param name="flags">Collection of flag descriptors. By default: 0 - walkable, 1 - obstacle, 3 - start, 4 - goal</param>
        public Field(int[][] map, Flags flags = null)
        {
            //Check input & define 'map'
            if (map.Length > 0 && map[0].Length > 0) this.map = map;
            else throw new ArgumentException("Argument 'map' has an invalid definition");

            //Set flags
            if (flags == null) this.flags = new Flags();
            else this.flags = flags;

            //Cast 'map' to  typeof 'List' by flattening the jagged array ('map') to be able to use LINQ expressions
            var mapList = this.map.SelectMany(sq => sq).ToList();

            //Get start & goal XY positions
            IEnumerable<int> startSquareRef = mapList.Where(sq => sq == this.flags.getFlag(FlagTag.START));
            IEnumerable<int> goalSquareRef = mapList.Where(sq => sq == this.flags.getFlag(FlagTag.GOAL));
            if (startSquareRef.Count() == 0 || goalSquareRef.Count() == 0)
                throw new ArgumentException("No 'START' or/and 'GOAL' flags found");
            else if (startSquareRef.Count() > 1 || goalSquareRef.Count() > 1)
                throw new ArgumentException("To many 'START' and/or 'GOAL' flags");

            int startPositionMapIndex = mapList.IndexOf(startSquareRef.First());
            int goalPositionMapIndex = mapList.IndexOf(goalSquareRef.First());

            //Declare start & goal squares
            this.startSquare = this.getSquareFromIndex(startPositionMapIndex);
            this.goalSquare = this.getSquareFromIndex(goalPositionMapIndex);
#if DEBUG
            Console.WriteLine("Start Square -> X: {0} | Y: {1} | I: {2}", startSquare.posX, startSquare.posY, startPositionMapIndex);
            Console.WriteLine("Goal Square -> X: {0} | Y: {1} | I: {2}", goalSquare.posX, goalSquare.posY, goalPositionMapIndex);
            Console.WriteLine();
#endif
        }

        /// <summary>
        /// Tries to find the best path on given map 
        /// </summary>
        /// <param name="maxTries">Maximum amount of squares evaluated</param>
        /// <param name="includeStartSquare">Should found path include starting square or not</param>
        /// <returns>Found path as IEnumerable of type 'Position' or 'null'. Position variable contains X/Y coordinates and movement direction (Left, Right, etc.)</returns>
        public IEnumerable<Position> findBest(int maxTries = 100, bool includeStartSquare = false)
        {
            //Declare search queues
            Queue<Square> openQueue = new Queue<Square>();
            Queue<Square> closedQueue = new Queue<Square>();

            //Define current (currently checked) square
            Square currentSquare = null;

            //Define G-Cost & try-counter variables
            int gCost, tryCounter;
            gCost = tryCounter = 0;
            //Declare path is found boolean
            bool pathFound = false;

            //Add start square to the open queue
            openQueue.Enqueue(startSquare);

            while (openQueue.Count > 0 && maxTries > tryCounter)
            {
                //Get lowest F-Cost
                currentSquare = openQueue.Min();

                //Add current square to the closed queue & remove it from the open queue
                closedQueue.Enqueue(currentSquare);
                //Remove first element of the queue which is currentSquare
                openQueue.Dequeue();

                //Check if current square is a goal square -> break loop
                if (currentSquare.EqualTo(goalSquare))
                {
                    pathFound = true;
                    break;
                }

                //Update G-Cost
                gCost += 1;

                //Get available squares
                List<Square> nextSquares = getNextSquareCollection(currentSquare);
                //Loop through squares
                nextSquares.ForEach(sq => {
                    //Check if this square exists in the closed queue
                    if (closedQueue.FirstOrDefault(i => i.posX == sq.posX && i.posY == sq.posY) != null)
                        return;

                    //Check if this square is in the open list
                    if (closedQueue.FirstOrDefault(i => i.posX == sq.posX && i.posY == sq.posY) == null)
                    {
                        //Update costs
                        sq.update(currentSquare, this.goalSquare, gCost);
                        //Add to the open queue
                        openQueue.Enqueue(sq);
                    }
                    else
                    {
                        //If current F-Cost is better than previous value -> update
                        if (gCost + sq.hCost < sq.fCost)
                            sq.update(currentSquare, this.goalSquare, gCost);
                    }
                });

                //Increase try-counter
                tryCounter += 1;
            }

            //Check if path is found
            if (!pathFound) return null;

            //Return found path
            List<Square> pathSquares = new List<Square>();
            while (currentSquare != null)
            {
                //Set movement direction
                currentSquare.setMovementDirection();
                //Add square to the path
                if (!(!includeStartSquare && currentSquare.EqualTo(this.startSquare)))
                    pathSquares.Add(currentSquare);
                //Set the next square
                currentSquare = currentSquare.parent;
            }
            //Make xy coor pairs and reverse the list
            return pathSquares.Select(sq => new Position { X = sq.posX, Y = sq.posY, direction = sq.movDirection }).Reverse();
        }

        /// <summary>
        /// Creates new 'Square' instance based on map index.
        /// Map index: 
        /// Y0[Start, 0, 0] Y1[0, Goal, 0] -> Start has a map index of 0 | Goal has a map index of 4
        /// </summary>
        /// <param name="positionIndex"></param>
        /// <returns>New 'Square' instance</returns>
        private Square getSquareFromIndex(int positionIndex)
        {
            return new Square { posX = positionIndex % this.map[0].Length, posY = positionIndex / this.map[0].Length };
        }

        /// <summary>
        /// Looks at the surroundings of the square (left, right, up, and down)
        /// </summary>
        /// <param name="currentSquare">Current square</param>
        /// <returns>List of walkable squares</returns>
        private List<Square> getNextSquareCollection(Square currentSquare)
        {
            List<Square> nextSquares = new List<Square>()
            {
                new Square { posX = currentSquare.posX - 1, posY = currentSquare.posY }, //Left square
                new Square { posX = currentSquare.posX + 1, posY = currentSquare.posY }, //Right square
                new Square { posX = currentSquare.posX, posY = currentSquare.posY - 1 }, //Up square
                new Square { posX = currentSquare.posX, posY = currentSquare.posY + 1 }, //Down square
            };

            //Return only those squares that are on the map & are walkable
            return nextSquares.Where(sq => (sq.posX < this.map[0].Length) && (sq.posX >= 0)
                && (sq.posY < this.map.Length) && (sq.posY >= 0)
                && (this.flags.transitAllowed().Contains(this.map[sq.posY][sq.posX])))
                .ToList();
        }
    }
}
