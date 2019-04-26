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
            while (!agent.getPosition().Equals(goalPos))
            {

                
                int agentPosX = agent.getPosition().getX();
                int agentPosY = agent.getPosition().getY();


                if (agent.getPosition().getY() < goalPos.getY())
                {
                    agent.goDown();
                }
                if (agent.getPosition().getY() > goalPos.getY())
                {
                    agent.goUp();
                }
                if (agent.getPosition().getX() < goalPos.getX())
                {
                    agent.goRight();
                }
                if (agent.getPosition().getX() > goalPos.getX())
                {
                    agent.goLeft();
                }
   
            }
            return agent.getPath();
        }

    }
}
