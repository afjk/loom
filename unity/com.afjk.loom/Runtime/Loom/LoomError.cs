using System;

namespace Afjk.Loom
{
    /// <summary>
    /// Exception thrown by the Loom engine.
    /// </summary>
    public sealed class LoomException : Exception
    {
        /// <summary>Machine-readable error code.</summary>
        public string Code { get; }

        /// <summary>Optional structured details about the error.</summary>
        public object Details { get; }

        public LoomException(string code, string message, object details = null)
            : base(message)
        {
            Code = code;
            Details = details;
        }
    }
}
