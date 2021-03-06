import React, { useContext, useState } from 'react'
import { EuiBetaBadge, EuiButton, EuiCard, EuiForm, EuiFormRow, EuiLoadingSpinner, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle, EuiSelect, EuiSpacer } from '@elastic/eui'
import { FlowContext } from '../context/FlowContext'
import { findShortestPath } from '../utils'
import { ToastContext } from '../context/ToastContext'
import { CalculationModalState } from '../utils/types'

function CreationModal({ closeModal }: { closeModal: () => void }) {

    const [state, setState] = useState<CalculationModalState>({
        startNode: 'default',
        endNode: 'default',
        isLoading: false,
        result: null
    })

    const { flow } = useContext(FlowContext)
    const { addToast } = useContext(ToastContext)

    const handleCalculate = async () => {
        setState({ ...state, isLoading: true })
        try {
            await new Promise(r => setTimeout(r, 500));
            const res = findShortestPath(flow, state.startNode, state.endNode)
            if (res.distance === "Infinity")
                throw new Error("No path found..");
            setState({ ...state, result: res, isLoading: false })
        } catch (error: any) {
            addToast({
                title: 'Action unsuccessful',
                color: 'danger',
                icon: 'crossInACircleFilled',
                text: error.message
            })
            setState({ ...state, isLoading: false })
        }
        // finally {
        //     setState({ ...state, isLoading: false })
        // }
    }

    return (
        <EuiModal onClose={closeModal}>
            <EuiModalHeader>
                <EuiModalHeaderTitle><h1>Calculate the shortest path</h1></EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
                <EuiForm component="div">
                    <EuiFormRow label="From :">
                        <EuiSelect
                            value={state.startNode}
                            onChange={e => setState({ ...state, startNode: e.target.value })}
                            options={flow.filter((elt) => !(elt.id as String).startsWith('e')).map((elt) => ({ text: elt.data.label, value: elt.id })).concat({ text: 'Choose a starting node', value: 'default' })}
                        />
                    </EuiFormRow>
                    <EuiFormRow label="To :">
                        <EuiSelect
                            value={state.endNode}
                            onChange={e => setState({ ...state, endNode: e.target.value })}
                            options={flow.filter((elt) => !(elt.id as String).startsWith('e')).map((elt) => ({ text: elt.data.label, value: elt.id })).concat({ text: 'Choose an ending node', value: 'default' })}
                        />
                    </EuiFormRow>
                </EuiForm>
                {
                    !state.isLoading && state.result &&
                    <>
                        <EuiSpacer />
                        <EuiCard title="Shortest Path: ">
                            {state.result.path.map((str: string, index: number) => (<><EuiBetaBadge key={`path ${index + 1}`} label={str} color="accent" />&emsp;{index + 1 < state.result!.path.length ? <><EuiBetaBadge label="->" color="hollow" />&emsp;</> : <></>}</>))}
                        </EuiCard>
                        <EuiSpacer />
                        <EuiCard title="Distance: ">
                            {state.result.distance}
                        </EuiCard>
                        <EuiSpacer />
                    </>
                }
                {
                    state.isLoading && <EuiLoadingSpinner style={{ marginTop: '20px' }} size="xl" />
                }
            </EuiModalBody>
            <EuiModalFooter>
                <EuiButton color="danger" onClick={closeModal} fill>Close</EuiButton>
                <EuiButton isLoading={state.isLoading} color="primary" onClick={handleCalculate} fill>Calculate</EuiButton>
            </EuiModalFooter>
        </EuiModal>
    )
}

export default CreationModal
