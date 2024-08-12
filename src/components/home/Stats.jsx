import React from 'react';
import 'semantic-ui-css/semantic.namespaced.min.css';
import { Icon, Label, Loader, Dimmer, Segment } from 'semantic-ui-react';
import '../../index.css';
import {useSummary} from "../../hooks/hooks.js";
import {useQuery} from "@tanstack/react-query";
import {apiClient} from "../../api/client.js";

const Stats = () => {
    const {data: recordCount, isLoading, error} = useSummary('count/records')
    const {data: recordsetCount, isLoadingrs, errorrs} = useSummary('count/recordsets/?rsq={"data.ingest": true}')
    const {data: mediaCount, isLoadingm, errorm} = useSummary('count/media')


    if (isLoading || isLoadingrs || isLoadingm) {
        return (
            <div id="sui">
                <Dimmer active>
                    <Loader size="large">Loading</Loader>
                </Dimmer>
            </div>
        )
    }

    return (
        <div className="bg-gray-100 flex item-center justify-center w-full h-64">
            <div id="sui" className="bg-gray-100 flex items-center w-auto space-x-44 columns-3">
                <div className="flex flex-col items-center space-y-5">
                    <Icon circular inverted color="black" name="bug" size="huge" />
                    <Label basic color="black">{recordCount?.itemCount.toLocaleString('en-US')} Specimen Records</Label>
                </div>
                <div className="flex flex-col items-center space-y-5">
                    <Icon circular inverted color="black" name="group" size="huge" />
                    <Label basic color="black">{recordsetCount?.itemCount.toLocaleString('en-US')} Recordsets</Label>
                </div>
                <div className="flex flex-col items-center space-y-5">
                    <Icon circular inverted color="black" name="images" size="huge" />
                    <Label basic color="black">{mediaCount?.itemCount.toLocaleString('en-US')} Media Records</Label>
                </div>
            </div>
        </div>
    )
}

export default Stats;