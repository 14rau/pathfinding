using System;

namespace Server
{
    class DumbEngine : APathfindingEngine
    {

        public DumbEngine(int[][] map) : base(map)
        {
        }

        public override string[] calculatePath()
        {
            foreach (Position position in goalPos)
                {

                while (!agent.getPosition().Equals(position))
                    {
                        if (agent.getPosition().getY() < position.getY())
                            agent.goDown();
                        
                        if (agent.getPosition().getY() > position.getY())
                            agent.goUp();
                        
                        if (agent.getPosition().getX() < position.getX())
                            agent.goRight();
                        
                        if (agent.getPosition().getX() > position.getX())
                            agent.goLeft();
                        
                    }
                }
  
            return agent.getPath();
        }

    }
}
