import React from 'react';
import '../../index.css';
import 'semantic-ui-css/semantic.min.css';
import { Icon, Label } from 'semantic-ui-react';

const Stats = () => {
    
    return (
        <div className="bg-white flex item-center justify-center w-full h-64">
            <div className="bg-white flex items-center justify-between w-auto space-x-20">
                <div>
                    <Icon circular inverted color="black" name="bug" size="huge" />
                    <Label>142,118,027 Specimen Records</Label>
                </div>

                <div>
                    <Icon circular inverted color="black" name="group" size="huge" />
                    <Label>1,852 Recordsets</Label>
                </div>

                <div>
                    <Icon circular inverted color="black" name="images" size="huge" />
                    <Label>56,652,346 Media Records</Label>
                </div>
            </div>
        </div>
    )
}

export default Stats;