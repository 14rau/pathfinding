using System;
using System.Collections.Generic;
using System.Linq;

namespace APathLib
{
    /// <summary>
    /// Flag tags serve to describe map squares
    /// START: start square of the agent
    /// GOAL: end/goal square of the agent
    /// OBSTACLE: Not walkable squares
    /// WALKABLE: walkable squares
    /// MISC: whatever you want it to be
    /// </summary>
    public enum FlagTag
    {
        START,
        GOAL,
        OBSTACLE,
        MISC,
        WALKABLE
    };

    /// <summary>
    /// Contains flag, flag tag and transistAllowed boolean
    /// </summary>
    struct Flag
    {
        public int flag { get; set; }
        public FlagTag tag { get; set; }
        public bool transitAllowed { get; set; }
    }

    /// <summary>
    /// Collection of flags
    /// </summary>
    class Flags
    {
        private List<Flag> flagCollection;

        //Default settings
        public Flags()
        {
            this.flagCollection = new List<Flag>()
            {
                new Flag { flag = 0, tag = FlagTag.WALKABLE, transitAllowed = true },
                new Flag { flag = 1, tag = FlagTag.OBSTACLE, transitAllowed = false },
                new Flag { flag = 3, tag = FlagTag.START, transitAllowed = false },
                new Flag { flag = 4, tag = FlagTag.GOAL, transitAllowed = true }
            };
        }

        public int[] transitAllowed()
        {
            return this.flagCollection.FindAll(f => f.transitAllowed == true).Select(f => f.flag).ToArray();
        }

        public int? getFlag(FlagTag flagTag)
        {
            if (this.flagCollection.Exists(f => f.tag == flagTag))
                return this.flagCollection.Find(f => f.tag == flagTag).flag;
            else
                return null;
        }

        //Custom settings
        public Flags(List<Flag> flagCollection)
        {
            //Check collection for must have data
            if (flagCollection.FindIndex(f => f.tag == FlagTag.START) == -1 || flagCollection.FindIndex(f => f.tag == FlagTag.GOAL) == -1)
                throw new ArgumentException("Flag collection does not contain a starting or an end point");

            this.flagCollection = flagCollection;
        }
    }
}
