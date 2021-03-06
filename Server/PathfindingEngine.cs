﻿using System.Collections.Generic;

namespace Server
{
    class PathfindingEngine : APathfindingEngine
    {

        public PathfindingEngine(int[][] map):base(map)
        {
        }

        public override string[] calculatePath()
        {
            List<string> path = new List<string>();
            while (goalPos.Count > 0)
            {
                Position target = new Position(-3,-3) ;
                string[] pathstep = new string[0];
                foreach(Position position in goalPos)
                {
                    if (target.getX() == -3 && target.getY() == -3) {
                        target = position;
                        pathstep = getPathTo(position);
                        continue;
                    }

                    string[] tmp = getPathTo(position);
                    if (tmp.Length < pathstep.Length)
                    {
                        target = position;
                        pathstep = tmp;
                    }

                }
                path.AddRange(pathstep);
                agent.reset(target);
                goalPos.Remove(target);
            }
            return path.ToArray();
            
        }

        public string[] getPathTo(Position goalPos)
        {
            while (!agent.getPosition().Equals(goalPos))
            {

                if (agent.getPosition().getLeft().Equals(goalPos))
                {
                    agent.goLeft();
                    break;
                }
                if (agent.getPosition().getRight().Equals(goalPos))
                {
                    agent.goRight();
                    break;
                }
                if (agent.getPosition().getUp().Equals(goalPos))
                {
                    agent.goUp();
                    break;
                }
                if (agent.getPosition().getDown().Equals(goalPos))
                {
                    agent.goDown();
                    break;
                }

                int agentPosX = agent.getPosition().getX();
                int agentPosY = agent.getPosition().getY();

                if (valueMap[agentPosX][agentPosY]++ > 10000)
                    break;

                int left, right, up, down;

                if (agentPosX > 0)
                    left = valueMap[agentPosX - 1][agentPosY] * agent.getPosition().getLeft().getDistanceTo(goalPos);
                else left = 0;
                if (agentPosX < valueMap.Length - 1)
                    right = valueMap[agentPosX + 1][agentPosY] * agent.getPosition().getRight().getDistanceTo(goalPos);
                else right = 0;
                if (agentPosY > 0)
                    up = valueMap[agentPosX][agentPosY - 1] * agent.getPosition().getUp().getDistanceTo(goalPos);
                else up = 0;
                if (agentPosY < valueMap[agentPosX].Length - 1)
                    down = valueMap[agentPosX][agentPosY + 1] * agent.getPosition().getDown().getDistanceTo(goalPos);
                else down = 0;

                switch (getBestDirection(right, left, up, down))
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

    }
}
