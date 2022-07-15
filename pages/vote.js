import styles from "../styles/Home.module.css";
import contractAddresses from "../contractAddresses.json";
import nativeTokenVaultContract from "../contracts/NativeTokenVault.json";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {
  Button,
  Modal,
  Typography,
  Tooltip,
  Icon,
  useNotification,
} from "web3uikit";
import { useState, useEffect } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import erc20 from "../contracts/erc20.json";
import RemoveVote from "../components/RemoveVote.json";
import Vote from "../components/Vote.json";
import DepositNativeToken from "../components/DepositNativeToken.json";
import WithdrawNativeToken from "../components/WithdrawNativeToken.json";

export default function Vote() {
  const { isWeb3Enabled, chainId, account } = useMoralis();
  const [nativeTokenBalance, setNativeTokenBalance] = useState("0");
  const [voteTokenBalance, setVoteTokenBalance] = useState("0");
  const [freeVotes, setFreeVotes] = useState("0");
  const [collectionVotes, setCollectionVotes] = useState("0");
  const [visibleDepositModal, setVisibleDepositModal] = useState(false);
  const [visibleWithdrawalModal, setVisibleWithdrawalModal] = useState(false);
  const [visibleVoteModal, setVisibleVoteModal] = useState(false);
  const [visibleRemoveVoteModal, setVisibleRemoveVoteModal] = useState(false);

  const addresses =
    chainId in contractAddresses
      ? contractAddresses[chainId]
      : contractAddresses["0x1"];
  const [collections, setCollections] = useState([
    {
      label: addresses.SupportedAssets[0].name,
      address: addresses.SupportedAssets[0].address,
    },
  ]);

  const { runContractFunction: getNativeTokenBalance } = useWeb3Contract();
  const { runContractFunction: getVoteTokenBalance } = useWeb3Contract();
  const { runContractFunction: getFreeVotes } = useWeb3Contract();
  const { runContractFunction: getCollectionVotes } = useWeb3Contract();

  async function updateUI() {
    // Get the native token balance
    const getNativeTokenBalanceOptions = {
      abi: erc20,
      contractAddress: addresses.NativeToken,
      functionName: "balanceOf",
      params: {
        _owner: account,
      },
    };
    const nativeTokenBalance = await getNativeTokenBalance({
      onError: (error) => console.log(error),
      params: getNativeTokenBalanceOptions,
    });
    setNativeTokenBalance(nativeTokenBalance.toString());

    //Get the vote token Balance
    const getVoteTokenBalanceOptions = {
      abi: erc20,
      contractAddress: addresses.NativeTokenVault,
      functionName: "balanceOf",
      params: {
        _owner: account,
      },
    };
    const voteTokenBalance = await getVoteTokenBalance({
      onError: (error) => console.log(error),
      params: getVoteTokenBalanceOptions,
    });
    setVoteTokenBalance(voteTokenBalance.toString());

    //Get the vote token Balance
    const getFreeVotesOptions = {
      abi: nativeTokenVaultContract.abi,
      contractAddress: addresses.NativeTokenVault,
      functionName: "getUserFreeVotes",
      params: {
        user: account,
      },
    };
    const freeVotes = await getFreeVotes({
      onError: (error) => console.log(error),
      params: getFreeVotesOptions,
    });
    setFreeVotes(freeVotes.toString());
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();

      //Fill the collections with the supported assets
      var updatedCollections = [];
      console.log("SupportedAssets", addresses.SupportedAssets);
      for (var asset in addresses.SupportedAssets) {
        updatedCollections.push({
          label: addresses.SupportedAssets[asset].name,
          address: addresses.SupportedAssets[asset].address,
        });
        console.log("asset", asset);
      }
      //setCollections(updatedCollections);
      console.log("updatedCollections", updatedCollections);
      setCollections(updatedCollections);
    }
  }, [isWeb3Enabled]);

  async function updateCollectionVotes(collection) {
    // Get the native token balance
    const getCollectionVotesOptions = {
      abi: nativeTokenVaultContract.abi,
      contractAddress: addresses.NativeTokenVault,
      functionName: "getUserCollectionVotes",
      params: {
        user: account,
        collection: collection,
      },
    };
    const collectionVotes = await getCollectionVotes({
      onError: (error) => console.log(error),
      params: getCollectionVotesOptions,
    });
    console.log("collectionVotes", collectionVotes);
    setCollectionVotes(collectionVotes.toString());
  }

  function handleCollectionChange(event, value) {
    console.log("value", value);
    console.log("collections", collections);
    const collectionAddress = collections.find(
      (collection) => collection.label == value
    ).address;
    if (collectionAddress) {
      updateCollectionVotes(collectionAddress);
    }
  }

  return (
    <div className={styles.container}>
      <Modal
        hasFooter={false}
        title="Deposit LE"
        isVisible={visibleDepositModal}
        width="50%"
        onCloseButtonPressed={function () {
          setVisibleDepositModal(false);
        }}
      >
        <DepositNativeToken setVisibility={visibleDepositModal} />
      </Modal>
      <Modal
        hasFooter={false}
        title="Withdraw LE"
        width="50%"
        isVisible={visibleWithdrawalModal}
        onCloseButtonPressed={function () {
          setVisibleWithdrawalModal(false);
        }}
      >
        <WithdrawNativeToken setVisibility={visibleWithdrawalModal} />
      </Modal>
      <Modal
        hasFooter={false}
        title="Vote"
        width="50%"
        isVisible={visibleVoteModal}
        onCloseButtonPressed={function () {
          setVisibleVoteModal(false);
        }}
      >
        <Vote setVisibility={setVisibleVoteModal} />
      </Modal>
      <Modal
        hasFooter={false}
        title="Remove Vote"
        width="50%"
        isVisible={visibleRemoveVoteModal}
        onCloseButtonPressed={function () {
          setVisibleRemoveVoteModal(false);
        }}
      >
        <RemoveVote setVisibility={setVisibleRemoveVoteModal} />
      </Modal>
      <div className="flex flex-row items-center justify-center border-4 m-8">
        <div className="flex flex-col items-center m-8">
          <div className="flex flex-row m-2">
            <Button
              text="Deposit"
              size="large"
              loadingProps={{
                spinnerColor: "#000000",
              }}
              loadingText="Confirming Deposit"
              isLoading={depositLoading}
              onClick={async function () {
                setVisibleDepositModal(true);
              }}
            ></Button>
          </div>
          <div className="flex flex-row m-2">
            <Button
              text="Withdraw"
              size="large"
              loadingProps={{
                spinnerColor: "#000000",
              }}
              loadingText="Confirming Withdrawal"
              isLoading={withdrawalLoading}
              onClick={async function () {
                setVisibleWithdrawalModal(true);
              }}
            ></Button>
          </div>
        </div>
        <div className="flex flex-col m-16">
          <div className="flex flex-col m-2">
            <div className="flex flex-row">
              <Typography variant="h2">Balance</Typography>
            </div>
            <div className="flex flex-row">
              <Typography variant="body16">
                {formatUnits(nativeTokenBalance, 18)} LE
              </Typography>
            </div>
          </div>
          <div className="flex flex-col m-2">
            <div className="flex flex-row">
              <Typography variant="h2">Vault Balance</Typography>
            </div>
            <div className="flex flex-row">
              <Typography variant="body16">
                {formatUnits(voteTokenBalance, 18)} veLE
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center border-4 m-8">
        <div className="flex flex-col">
          <div className="flex flex-row items-center mt-8 justify-center">
            <div className="flex flex-col">
              <div className="flex flex-col m-2">
                <div className="flex flex-row">
                  <Typography variant="subtitle2">Free Votes</Typography>
                </div>
                <div className="flex flex-row">
                  <Typography variant="body16">
                    {formatUnits(freeVotes, 18)} veLE
                  </Typography>
                </div>
              </div>
              <div className="flex flex-col m-2">
                <div className="flex flex-row">
                  <Typography variant="subtitle2">Used Votes</Typography>
                </div>
                <div className="flex flex-row">
                  <Typography variant="body16">
                    {formatUnits(
                      BigNumber.from(voteTokenBalance).sub(freeVotes),
                      18
                    )}{" "}
                    veLE
                  </Typography>
                </div>
              </div>
            </div>
            <div className="flex flex-col ml-16">
              <Autocomplete
                disablePortal
                options={collections}
                defaultValue={collections[0]}
                sx={{ width: 300 }}
                isOptionEqualToValue={(option, value) =>
                  option.address === value.address
                }
                onInputChange={handleCollectionChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Supported Collections"
                    sx={{
                      "& label": { paddingLeft: (theme) => theme.spacing(2) },
                      "& input": { paddingLeft: (theme) => theme.spacing(3.5) },
                      "& fieldset": {
                        paddingLeft: (theme) => theme.spacing(2.5),
                        borderRadius: "25px",
                      },
                    }}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex flex-row rounded justify-center items-center mt-16 mb-8">
            <div className="flex flex-col mx-8">
              <div className="flex flex-row justify-center items-center  m-2">
                <Button
                  text="Vote"
                  loadingProps={{
                    spinnerColor: "#000000",
                  }}
                  loadingText="Confirming Vote"
                  isLoading={voteLoading}
                  onClick={async function () {
                    setVisibleVoteModal(true);
                  }}
                ></Button>
              </div>
              <div className="flex flex-row justify-center items-center  m-2">
                <Button
                  text="Remove Vote"
                  loadingProps={{
                    spinnerColor: "#000000",
                  }}
                  loadingText="Confirming Vote Removal"
                  isLoading={removeVoteLoading}
                  onClick={async function () {
                    setVisibleRemoveVoteModal(true);
                  }}
                ></Button>
              </div>
            </div>
            <div className="flex flex-col mx-8">
              <div className="flex flex-row m-2">
                <div className="flex flex-col">
                  <div className="flex flex-row">
                    <Typography variant="subtitle1"> My Votes</Typography>
                  </div>
                  <div className="flex flex-row">
                    <Typography variant="body16">
                      {formatUnits(collectionVotes, 18)} veLE
                    </Typography>
                  </div>
                </div>
              </div>
              <div className="flex flex-row m-2">
                <div className="flex flex-col">
                  <div className="flex flex-row">
                    <Typography variant="subtitle1"> LTV Boost</Typography>
                  </div>
                  <div className="flex flex-row">
                    <Typography variant="body16">0%</Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
