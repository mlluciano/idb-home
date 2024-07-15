import React from 'react';
import 'semantic-ui-css/semantic.namespaced.min.css';
import { Icon, Label } from 'semantic-ui-react';
import '../../index.css';

const Stats = () => {

    return (
        <div className="bg-gray-100 flex item-center justify-center w-full h-64">
            <div id="sui" className="bg-gray-100 flex items-center w-auto space-x-44 columns-3">
                <div className="flex flex-col items-center space-y-5">
                    <Icon circular inverted color="black" name="bug" size="huge" />
                    <Label basic color="black">142,118,027 Specimen Records</Label>
                </div>

                <div className="flex flex-col items-center space-y-5">
                    <Icon circular inverted color="black" name="group" size="huge" />
                    <Label basic color="black">1,852 Recordsets</Label>
                </div>

                <div className="flex flex-col items-center space-y-5">
                    <Icon circular inverted color="black" name="images" size="huge" />
                    <Label basic color="black">56,652,346 Media Records</Label>
                </div>
            </div>
        </div>
    )
}

export default Stats;