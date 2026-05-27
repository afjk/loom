using System;

namespace Loomlet.Runtime
{
    public sealed class LoomletException : Exception
    {
        public string Code { get; }

        public LoomletException(string code, string message) : base(message)
        {
            Code = code;
        }
    }
}
