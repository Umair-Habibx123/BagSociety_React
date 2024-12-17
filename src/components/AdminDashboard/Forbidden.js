import React from "react";

const Forbidden = () => {
    return (
        <div className="h-screen bg-black text-green-400 flex flex-col justify-center items-center p-5">
            {/* Terminal-style Container */}
            <div className="max-w-4xl w-full text-center border border-green-500 p-6 rounded-md shadow-md">
                {/* Error Title */}
                <h1 className="text-6xl md:text-8xl font-bold tracking-wide mb-4 animate-pulse">
                    403<span className="text-red-500">_</span>
                </h1>
                {/* Funny Hacker Text */}
                <p className="text-lg md:text-2xl font-mono mb-6">
                    {"// Access Denied: You don't have enough clearance to hack into this page."}
                </p>
                {/* ASCII Art */}
                <pre className="whitespace-pre-wrap text-xs md:text-base leading-tight mb-6">
                    {`
   (\\__/)
   (•ㅅ•)     ~ ERROR: YOU SHALL NOT PASS! ~
   /   つ   
`}
                </pre>
                {/* Suggestions */}
                <p className="text-sm md:text-base font-mono">
                    Hint: Double-check your permissions, or contact your <span className="text-red-500">sysadmin</span>.
                </p>
            </div>
            {/* Footer */}
            <div className="text-green-400 text-xs mt-6 font-mono">
                <p>System Log: Unauthorized access attempt detected 🚨</p>
            </div>
        </div>
    );
};

export default Forbidden;
