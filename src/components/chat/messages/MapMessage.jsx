import React from "react";

const MapMessage = ({ message, index, handleArtifactClick }) => {

    return (
        <div className="min-w-1/2" onClick={() => handleArtifactClick(index)}>
            <div className="flex flex-col items-start justify-start bg-zinc-800 min-h-9 rounded-lg hover:cursor-pointer border-zinc-600 border">
        <span className="bold px-2 pt-1 justify-start">
          Map of{' '}
            {message.value.rq.scientificname
                ? message.value.rq.scientificname
                : JSON.stringify(message.value.rq)}
        </span>
                <span className="px-2 pb-1 font-extralight text-sm">Click to view</span>
            </div>
        </div>
    );
};

export default MapMessage;
