using System;

namespace APathLib
{
    /// <summary>
    /// Enum describes direction of movement.
    /// </summary>
    public enum Direction
    {
        Start = -1,
        Left = 0,
        Right = 1,
        Up = 2,
        Down = 3
    };

    /// <summary>
    /// Contains X/Y coordinates and movement direction
    /// </summary>
    public struct Position
    {
        public int X { get; set; }
        public int Y { get; set; }
        public Direction direction { get; set; }
    };

    class Square : IComparable<Square>
    {
        //Square XY position
        public int posX { get; set; }
        public int posY { get; set; }
        //Movement direction
        public Direction movDirection { get; private set; }
        /*
         * Square costs:
         *      G-Cost: Cost of getting to this square counting from the start
         *      H-Cost: Cost of getting from this square to the end-point
         *      F-Cost: Sum of G-Cost & H-Cost
         */
        public double gCost { get; private set; }
        public double hCost { get; private set; }
        public double fCost { get; private set; }
        //Previous square
        public Square parent { get; private set; }

        public int CompareTo(Square square)
        {
            //Check F-Costs
            if (this.fCost > square.fCost) return 1;
            else if (this.fCost < square.fCost) return -1;
            //If equal -> compare H-Costs
            else if (this.hCost < square.hCost) return 1;
            else if (this.hCost > square.hCost) return -1;
            //If still equal
            else return 0;
        }

        public bool EqualTo(Square square)
        {
            if (this.posX == square.posX && this.posY == square.posY)
                return true;
            return false;
        }

        public void update(Square parent, Square goalSquare, double gCost)
        {
            this.parent = parent;
            this.gCost = gCost;
            this.hCost = Math.Abs(goalSquare.posY - this.posY) + Math.Abs(goalSquare.posX - this.posX);
            this.fCost = gCost + hCost;
        }

        public void setMovementDirection()
        {
            if (this.parent == null) this.movDirection = Direction.Start;
            else if (this.parent.posX - 1 == this.posX) this.movDirection = Direction.Left;
            else if (this.parent.posX + 1 == this.posX) this.movDirection = Direction.Right;
            else if (this.parent.posY - 1 == this.posY) this.movDirection = Direction.Up;
            else if (this.parent.posY + 1 == this.posY) this.movDirection = Direction.Down;
        }
    }
}
