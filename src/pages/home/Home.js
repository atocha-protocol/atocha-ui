import React, {useState, createRef} from 'react';
import {Container, Dimmer, Loader, Grid, Sticky, Message} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import $ from 'jquery';
import config from '../../config'

import {SubstrateContextProvider, useSubstrate} from '../../substrate-lib';
import {DeveloperConsole} from '../../substrate-lib/components';

import AccountSelector from '../../units/AccountSelector';
import Balances from '../../units/Balances';
import BlockNumber from '../../units/BlockNumber';
import Events from '../../units/Events';
import Interactor from '../../units/Interactor';
import Metadata from '../../units/Metadata';
import NodeInfo from '../../units/NodeInfo';
import TemplateModule from '../../TemplateModule';
import Transfer from '../../units/Transfer';
import Upgrade from '../../units/Upgrade';
import AtochaAccountSelector from "../../units/AtochaAccountSelector";

function Main() {
    const [accountAddress, setAccountAddress] = useState(null);
    const {api, apiState, keyring, keyringState, apiError} = useSubstrate();
    const accountPair =
        accountAddress &&
        keyringState === 'READY' &&
        keyring.getPair(accountAddress);

    const [requestInfoArr, setRequestInfoArr] = useState([])
    const [responseInfoArr, setResponseInfoArr] = useState([])
    let [aaa, setAaa] = useState(0)

    const loader = text =>
        <Dimmer active>
            <Loader size='small'>{text}</Loader>
        </Dimmer>;

    const message = err =>
        <Grid centered columns={2} padded>
            <Grid.Column>
                <Message negative compact floating
                         header='Error Connecting to Atocha'
                         content={`${JSON.stringify(err, null, 4)}`}
                />
            </Grid.Column>
        </Grid>;

    if (apiState === 'ERROR') return message(apiError);
    else if (apiState !== 'READY') return loader('Connecting to Atocha');

    if (keyringState !== 'READY') {
        return loader('Loading accounts (please review any extension\'s authorization)');
    }

    const getFromAcct = async () => {
        const {
            address,
            meta: { source, isInjected }
        } = accountPair
        let fromAcct

        // signer is from Polkadot-js browser extension
        if (isInjected) {
            const injected = await web3FromSource(source)
            fromAcct = address
            api.setSigner(injected.signer)
        } else {
            fromAcct = accountPair
        }
        return fromAcct
    }

    const contextRef = createRef();

    // Get current selection account.
    const accountId = accountPair == undefined ? "None" : accountPair.address

    function submitPuzzle() {
        console.log("RUN submitPuzzle ")
        const puzzle_title = $('input[name="puzzle_title"]').val()
        const puzzle_detail = $('textarea[name="puzzle_detail"]').val()
        const duration_block = $('input[name="duration_block"]').val()
        const answer_detail = $('textarea[name="answer_detail"]').val()
        const ticket = $('input[name="ticket"]').val()
        const version = $('input[name="version"]').val()
        const account_id = accountId
        //
        const api_submit_of_puzzle = `${config.IPFS_API_HOST}/ipfs/puzzle`
        const post_data = {
            public_key: accountId,
            puzzle_title,
            puzzle_detail,
            answer_detail,
            duration_block,
            ticket,
            version,
        }
        console.log('POST-DATA::', post_data)
        requestInfoArr.unshift(post_data)
        $.post(api_submit_of_puzzle, post_data, function (data, status) {
            console.log("RUN ajax post response: ", data, status)
            if ("success" == status) {
                responseInfoArr.unshift(data)
            }else{
                // responseInfoArr(responseInfoArr)
            }
            setAaa(++aaa)

            // pre data
            let puzzle_owner = accountId
            let puzzle_hash = 'PUZZLE_HASH'
            let answer_hash = 'ANSWER_HASH'
            let ticket = 400
            let relation_type = 1
            let duration = 30

            // submit info to atocha-chain
            const transfer = api.tx.atochaModule.createPuzzle(puzzle_owner, puzzle_hash, answer_hash, ticket, relation_type, duration)

            // Send extrinsics
            getFromAcct().then((value)=>{
                console.log("get from acct : ", value)
                transfer.signAndSend(value, ({ events = [], status }) => {
                    console.log(`Current status is ${status.type}`)
                    events.forEach(({ phase, event: { data, method, section } }) => {
                        console.log(`\t' ${phase}: ${section}.${method}:: ${data}`)
                    });
                })
            });

        })
    }

    return (
        <div ref={contextRef}>
            <Sticky context={contextRef}>
                <AtochaAccountSelector setAccountAddress={setAccountAddress}/>
            </Sticky>
            <Container>
                <Grid stackable columns='equal'>
                    <div className="sixteen wide column">
                        <i className="cn flag"></i>
                        <div>Current Account ID: {accountId}</div>
                    </div>
                    <div className="sixteen wide column">
                        {/*public_key=1&
                        puzzle_title=2&
                        ticket=3&
                        expire_date=4&
                        answer_detail=Answer detail.&
                        version=6&
                        puzzle_detail=Puzzle*/}
                        <form className="ui form">
                            <div className="field">
                                <label>Puzzle title</label>
                                <input type="text" name="puzzle_title" placeholder="Puzzle Title"/>
                            </div>
                            <div className="field">
                                <label>Puzzle detail</label>
                                <textarea name="puzzle_detail" placeholder="Puzzle detail"></textarea>
                            </div>
                            <div className="field">
                                <label>Ticket</label>
                                <input type="text" name="ticket" placeholder="Ticket"/>
                            </div>
                            <div className="field">
                                <label>Expire Date ( Your need convert to duration block number)</label>
                                <input type="text" name="duration_block" placeholder="Duration Block"/>
                            </div>
                            <div className="Answer Detail">
                                <label>Answer Detail</label>
                                <textarea name="answer_detail" placeholder="Answer Detail"></textarea>
                            </div>
                            <div className="field">
                                <label>Puzzle version: (Option)</label>
                                <input type="text" name="version" placeholder="Version"/>
                            </div>
                            <button className="ui button" type="button" onClick={submitPuzzle}>
                                Submit   : {aaa}
                            </button>
                        </form>
                    </div>
                    <div className="sixteen wide column">
                        <div>Input info count: {requestInfoArr.length}</div>
                        {
                            requestInfoArr.map((item, index)=>{
                                return <div key={index}>
                                    <div>--- Request info:</div>
                                    <div>{JSON.stringify(item)} - </div>
                                    <div>--- Response info:</div>
                                    <div>{JSON.stringify(responseInfoArr[index])} </div>
                                    <div>SHOW creator's Puzzle: <a target="_blank" href={`${config.IPFS_API_HOST}/ipfs/item/${responseInfoArr[index].puzzle_hash}`}>{responseInfoArr[index].puzzle_hash}</a> </div>
                                    <div>SHOW creator's Answer: <a target="_blank" href={`${config.IPFS_API_HOST}/ipfs/item/${responseInfoArr[index].answer_hash}`}>{responseInfoArr[index].answer_hash}</a> </div>
                                    <div>********</div>
                                </div>
                            })
                        }
                    </div>
                </Grid>
            </Container>
        </div>
    );
}

export default function Home() {
    return (
        <SubstrateContextProvider>
            <Main/>
        </SubstrateContextProvider>
    );
}
