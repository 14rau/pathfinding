using PathLib.Genetic;
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
namespace PathLib
{
    public class Field
    {
        //References
        private Flags flags;
        //YX-Map container
        private int[][] map;
        private int mapXLength;
        private int mapYLength;
        //Define start & goal squares
        private Square startSquare;
        private Square goalSquare;
        //Define Feed-Forward network
        private NetworkManager networkManager;
        private int genMaxSteps = 100;

        /// <summary>
        /// Initializes a new field (map) with given/default flags
        /// </summary>
        /// <param name="map">Map matrix</param>
        /// <param name="flags">Collection of flag descriptors. By default: 0 - walkable, 1 - obstacle, 3 - start, 4 - goal</param>
        public Field(int[][] map, Flags flags = null)
        {
            //Check input & define 'map'
            if (map.Length > 0 && map[0].Length > 0)
            {
                this.map = map;
                this.mapXLength = map[0].Length;
                this.mapYLength = map.Length;
            }
            else
                throw new ArgumentException("Argument 'map' has an invalid definition");

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
            else if(startSquareRef.Count() > 1 || goalSquareRef.Count() > 1)
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
        public IEnumerable<Position> aStarBest(int maxTries = 100, bool includeStartSquare = false)
        {
            //Declare search queues
            List<Square> openQueue = new List<Square>();
            List<Square> closedQueue = new List<Square>();

            //Define current (currently checked) square
            Square currentSquare = null;

            //Define G-Cost & try-counter variables
            int gCost, tryCounter;
            gCost = tryCounter = 0;
            //Declare path is found boolean
            bool pathFound = false;

            //Add start square to the open queue
            openQueue.Add(startSquare);

            while (openQueue.Count > 0 && maxTries > tryCounter)
            {
                //Get lowest F-Cost
                currentSquare = openQueue.Min();

                //Add current square to the closed queue & remove it from the open queue
                closedQueue.Add(currentSquare);
                //Remove first element of the queue which is currentSquare
                openQueue.Remove(currentSquare);

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

                    //Check if this square is in the open queue
                    if(openQueue.FirstOrDefault(i => i.posX == sq.posX && i.posY == sq.posY) == null)
                    {
                        //Update costs
                        sq.update(currentSquare, this.goalSquare, gCost);
                        //Add to the open queue
                        openQueue.Add(sq);
                    }else
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
				if(!currentSquare.EqualTo(this.startSquare))
                    pathSquares.Add(currentSquare);
                else
                    if(includeStartSquare)
                        pathSquares.Add(currentSquare);
                //Set the next square
                currentSquare = currentSquare.parent;
            }
            //Make xy coor pairs and reverse the list
            return pathSquares.Select(sq => new Position { X = sq.posX, Y = sq.posY, direction = sq.movDirection }).Reverse();
        }

        public IEnumerable<Position> geneticFindBest(int population, int generations, int genMaxSteps = 100)
        {
            this.networkManager = new NetworkManager(this.map, this.mapXLength, this.mapYLength, population, generations, genMaxSteps);
            networkManager.netInputNeuronCount = this.mapXLength * this.mapYLength + (2 * 3);
            networkManager.initNetwork();
            //Train network
            networkManager.trainNetwork(pathingFitnessDelegate);
            //Run network
            return networkManager.runNetwork(pathingRunDelegate);
        }

        private double pathingFitnessDelegate(double[] weights)
        {
            //Set new weights
            this.networkManager.setNetworkWeights(this.networkManager.network, weights);
            // Declare new agent fitness
            double agentFitness = 0;
            //Declare current (currently checked) square
            Square currentSquare = this.startSquare;
            //Collection of already checked squares
            List<Square> visitedSquareCollection = new List<Square>();

            //Loop until goal square is found or max amount of steps is exceed
            for (int step = 0; step < this.genMaxSteps; step++)
            {
                //Decrease fitness after each step
                agentFitness -= 1;

                //Convert map int jagged array to double flattened array/list
                List<double> mapInputs = Array.ConvertAll<int, double>(this.map.SelectMany(sq => sq).ToArray(), x => x).ToList();
                //Add map length, start coor & goal coor
                mapInputs.AddRange(new double[] {
                    (double)this.mapXLength, (double)this.mapYLength,
                    (double)this.goalSquare.posX, (double)this.goalSquare.posY,
                    (double)currentSquare.posX, (double)currentSquare.posY
                });

                //Run network
                /*
                 * Output:
                 *      0 - Left
                 *      1 - Right
                 *      2 - Up
                 *      3 - Down
                 */
                List<double> output = this.networkManager.network.Run(mapInputs.ToArray()).ToList();
                //Manage directions
                //Create a square as suggested by the network
                Square suggestedSquare = null;

                for (int j = 0; j < 4; j++) //4 being amount of directions that could be taken by the agent, so left, right, up & down 
                {
                    //Get max output
                    var tempOut = output;
                    tempOut = tempOut.OrderByDescending(t => t).ToList();
                    int actionIndex = output.IndexOf(tempOut[j]);

                    switch (actionIndex)
                    {
                        case 0: suggestedSquare = new Square { posX = currentSquare.posX - 1, posY = currentSquare.posY, movDirection = Direction.Left }; break;
                        case 1: suggestedSquare = new Square { posX = currentSquare.posX + 1, posY = currentSquare.posY, movDirection = Direction.Right }; break;
                        case 2: suggestedSquare = new Square { posX = currentSquare.posX, posY = currentSquare.posY - 1, movDirection = Direction.Up }; break;
                        case 3: suggestedSquare = new Square { posX = currentSquare.posX, posY = currentSquare.posY + 1, movDirection = Direction.Down }; break;
                    }


                    //Get next walkable squares
                    List<Square> nextSquareCollection = getNextSquareCollection(currentSquare);

                    //Assign new current square
                    if (nextSquareCollection.FirstOrDefault(sq =>
                        sq.posX == suggestedSquare.posX && sq.posY == suggestedSquare.posY) == null
                        || visitedSquareCollection.FirstOrDefault(sq => sq.posX == suggestedSquare.posX && sq.posY == suggestedSquare.posY) != null)
                    {
                        agentFitness -= 10;
                    }
                    else
                        break;
                }

                //Add square to visited square collection
                visitedSquareCollection.Add(currentSquare);
                //Set current square to be a suggested square
                currentSquare = suggestedSquare;

                //If goal square is found -> break the loop
                if (currentSquare.EqualTo(this.goalSquare))
                {
                    agentFitness += 1000;
                    break;
                }
            }

            return agentFitness;
        }

        private List<Position> pathingRunDelegate()
        {
            //Init position collection
            List<Position> positionCollection = new List<Position>();
            //Declare current (currently checked) square
            Square currentSquare = this.startSquare;
            //Collection of already checked squares
            List<Square> visitedSquareCollection = new List<Square>();

            //Loop until goal square is found or max amount of steps is exceed
            for (int step = 0; step < this.genMaxSteps; step++)
            {
                //Convert map int jagged array to double flattened array/list
                List<double> mapInputs = Array.ConvertAll<int, double>(this.map.SelectMany(sq => sq).ToArray(), x => x).ToList();
                //Add map length, start coor & goal coor
                mapInputs.AddRange(new double[] {
                    (double)this.mapXLength, (double)this.mapYLength,
                    (double)this.goalSquare.posX, (double)this.goalSquare.posY,
                    (double)currentSquare.posX, (double)currentSquare.posY
                });

                //Run network
                /*
                 * Output:
                 *      0 - Left
                 *      1 - Right
                 *      2 - Up
                 *      3 - Down
                 */
                List<double> output = this.networkManager.network.Run(mapInputs.ToArray()).ToList();
                //Manage directions
                //Create a square as suggested by the network
                Square suggestedSquare = null;

                for (int j = 0; j < 4; j++) //4 being amount of directions that could be taken by the agent, so left, right, up & down 
                {
                    //Create new temp list and order it by DESC to get actions by their values
                    var tempOut = output;
                    //Order
                    tempOut = tempOut.OrderByDescending(t => t).ToList();
                    //Get best value
                    int actionIndex = output.IndexOf(tempOut[j]);
                    //Create 4 possible next squares
                    switch (actionIndex)
                    {
                        case 0: suggestedSquare = new Square { posX = currentSquare.posX - 1, posY = currentSquare.posY, movDirection = Direction.Left }; break;
                        case 1: suggestedSquare = new Square { posX = currentSquare.posX + 1, posY = currentSquare.posY, movDirection = Direction.Right }; break;
                        case 2: suggestedSquare = new Square { posX = currentSquare.posX, posY = currentSquare.posY - 1, movDirection = Direction.Up }; break;
                        case 3: suggestedSquare = new Square { posX = currentSquare.posX, posY = currentSquare.posY + 1, movDirection = Direction.Down }; break;
                    }


                    //Get next walkable squares
                    List<Square> nextSquareCollection = getNextSquareCollection(currentSquare);

                    //Assign new current square
                    if (nextSquareCollection.FirstOrDefault(sq =>
                        sq.posX == suggestedSquare.posX && sq.posY == suggestedSquare.posY) != null
                        && visitedSquareCollection.FirstOrDefault(sq => sq.posX == suggestedSquare.posX && sq.posY == suggestedSquare.posY) == null)
                        break;
                }

                //Add square to the visited square collection
                visitedSquareCollection.Add(currentSquare);
                //Set current square to the suggested square
                currentSquare = suggestedSquare;
                //Add square to the current path
                if (!currentSquare.EqualTo(this.startSquare))
                    positionCollection.Add(new Position { X = currentSquare.posX, Y = currentSquare.posY, direction = currentSquare.movDirection });

                //If goal square is found -> break the loop
                if (currentSquare.EqualTo(this.goalSquare)) break;
            }

            return positionCollection;
        }

        /// <summary>
        /// Function uses Dijkstra’s path algorithm to find the shortest path on the given map
        /// </summary>
        /// <returns>Returns shortest path (or null if no path was found) in form of a list of 'Position's</returns>
        public IEnumerable<Position> dijkstrasBest()
        {
            //Init current square -> first square is 'start square'
            Square currentSquare = this.startSquare;
            //Set gCost (distance cost) of the first square (start square) to 0 / no parent since its the first square
            currentSquare.update(null, 0);
            //Init open and visited queues
            //Open queue will contain squares that have to be evaluated
            //Visited queue will contain squares that have been evaluated already
            List<Square> openQueue = new List<Square>();
            List<Square> visitedQueue = new List<Square>();
            //Add first square to open queue
            openQueue.Add(currentSquare);

            //Loop until there are no squares left to look at or until 'break' happens inside the loop
            while (openQueue.Count > 0)
            {
                //Get walkable squares and evaluate each
                getNextSquareCollection(currentSquare).ForEach(sq =>
                {
                    //If square has been visited already -> exit
                    //If gCost of the square has been inited or gCost of current path is lower than the priveous one -> update parent & gCost
                    //If open queue does not contain this square already -> add it to the queue
                    if (visitedQueue.FirstOrDefault(i => i.posX == sq.posX && i.posY == sq.posY) != null) return;
                    if (sq.gCost == 0 || currentSquare.gCost + 1 < sq.gCost) sq.update(currentSquare, currentSquare.gCost + 1);
                    if (openQueue.FirstOrDefault(i => i.posX == sq.posX && i.posY == sq.posY) == null) openQueue.Add(sq);
                });
                //Mark this square by adding it to the visited queue and remove it from the open queue since all possibilities were evaluated
                openQueue.Remove(currentSquare);
                visitedQueue.Add(currentSquare);

                //If open queue still constains items:
                // - check if goal square was already found
                //   - if yes -> check if there are squares with lower gCost than the gCost of the goalSquare
                //      - if no -> break the loop since there is no better path
                //Also set current square to be the first square from the open queue
                if (openQueue.Count > 0)
                {
                    //Get found goal square or null 
                    Square fGoalSquare = visitedQueue.FirstOrDefault(sq => sq.posX == this.goalSquare.posX && sq.posY == this.goalSquare.posY);
                    if (fGoalSquare != null)
                    {
                        //Get min gCost of open queue
                        Square minOpenSquare = openQueue.Min();
                        if (minOpenSquare.gCost > fGoalSquare.gCost) break;
                    }
                    //Redefine current square
                    currentSquare = openQueue.First();
                }
            }

            //Check if goal square was found
            //If not return null
            Square fSquare = visitedQueue.FirstOrDefault(sq => sq.posX == this.goalSquare.posX && sq.posY == this.goalSquare.posY);
            if (fSquare == null) return null;

            //Create list of positions
            List<Square> shortestPath = new List<Square>();
            //While start square not reached add squares to 'shortestPath' list
            while (true)
            {
                //Set direction of the movement
                fSquare.setMovementDirection();
                //Add new position
                shortestPath.Add(fSquare); //new Position { X = fSquare.posX, Y = fSquare.posY, direction = fSquare.movDirection }
                //Set next square to be the parent of the current square
                fSquare = fSquare.parent;
                //If start square is reached -> break out of the loop
                if (fSquare.EqualTo(this.startSquare)) break;
            }

            //Make xy coor pairs and reverse the list
            return shortestPath.Select(sq => new Position { X = sq.posX, Y = sq.posY, direction = sq.movDirection }).Reverse();
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
