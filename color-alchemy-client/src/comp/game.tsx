/* eslint-disable react-hooks/exhaustive-deps */
import React, { DragEvent, FC, useEffect, useState } from "react";
import { AppUtil } from "../util/appUtil";
import { ECellType, EGameStatus } from "../util/enums";
import { CellDataType, DataType, GameDataType, ServerDataType } from "../util/types";
import GameContainer from "./game-container";
import Info from "./info";
import ConfirmationBox from "../util/confirmationBox";

const Game: FC = () => {
  const [data, setData] = useState<DataType>({});
  const [cellData, setCellData] = useState<CellDataType[][]>([]);
  const [delta, setDelta] = useState<number>(AppUtil.envVar.delta);
  const [closestCellId, setClosestCellId] = useState("1,1");
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    updateClosestColorAndDelta();
  }, [cellData]);

  useEffect(() => {
    resetCellBorderColors();
    updateClosestColorCellBorder(closestCellId);
  }, [closestCellId]);

  useEffect(() => {
    hasGameWon();
  }, [delta]);

  const isGameOver = (stepCount: number) => {
    if ((data.initial?.maxMoves as number) - stepCount === 0) {
      setFinishGameData("You have lost the game. Do you want to play again?");
    }
  };

  const hasGameWon = () => {
    if (delta < AppUtil.envVar.deltaWinCondition) {
      setFinishGameData("You have won the game. Do you want to play again?");
    }
  };

  const setFinishGameData = (msg: string) => {
    setData((prevState) => ({
      ...prevState,
      game: {
        ...(prevState.game as GameDataType),
        status: EGameStatus.FINISHED,
      },
    }));
    setConfirmMessage(msg);
  }

  const updateClosestColorAndDelta = () => {
    const { leastDelta, closestColor } = calculateLeastDeltaAndColor();

    setData((prevState) => ({
      ...prevState,
      game: {
        ...(prevState.game as GameDataType),
        closestColor,
      },
    }));

    setDelta(leastDelta);
  };

  const resetCellBorderColors = () => {
    setCellData((prevState) => {
      const updatedField = AppUtil.cloneCellData(prevState);

      for (let y = 1; y <= (data.initial?.height as number); y++) {
        for (let x = 1; x <= (data.initial?.width as number); x++) {
          updatedField[y][x] = {
            ...updatedField[y][x],
            borderColor: AppUtil.envVar.borderColor,
          };
        }
      }

      return updatedField;
    });
  };

  const updateClosestColorCellBorder = (cellId: string) => {
    setCellData((prevState) => {
      const coord = AppUtil.getParsedCellId(cellId);
      const updatedField = AppUtil.cloneCellData(prevState);

      if (updatedField[coord.y]?.[coord.x]) {
        updatedField[coord.y][coord.x] = {
          ...updatedField[coord.y][coord.x],
          borderColor: AppUtil.envVar.closestColorBorder,
        };
      }

      return updatedField;
    });
  };

  const calculateLeastDeltaAndColor = () => {
    let leastDelta = AppUtil.envVar.delta;
    let closestColor = [0, 0, 0];
    const targetColor = data.initial?.target as number[];
    let cellColor;
    let currentDelta;
    let cellClosest = "";

    for (let y = 1; y <= (data.initial?.height as number); y++) {
      for (let x = 1; x <= (data.initial?.width as number); x++) {
        cellColor = cellData[y][x].color;
        //if cell has initial color then laeve that cell
        if (cellColor[0] !== 0 || cellColor[1] !== 0 || cellColor[2] !== 0) {
          //'Δ=1255×1√3×√(r1−r2)2+(g1−g2)2+(b1−b2)2'
          const sqrt = Math.sqrt(Math.pow(targetColor[0] - cellColor[0], 2) + Math.pow(targetColor[1] - cellColor[1], 2) + Math.pow(targetColor[2] - cellColor[2], 2));
          currentDelta = (1 / 255 / Math.sqrt(3)) * sqrt * 100;
          if (currentDelta < leastDelta) {
            cellClosest = x + "," + y;
            leastDelta = currentDelta;
            closestColor = cellColor;
          }
        }
      }
    }
    if(cellClosest) {
      setClosestCellId(cellClosest);
    }
    return { leastDelta, closestColor };
  };

  const fetchInitialData = () => {
    let url = AppUtil.envVar.serverUrl + AppUtil.envVar.initEndPoint;
    if (data.initial?.userId) {
      url += `/${AppUtil.envVar.userEndPoint}/${data.initial?.userId}`;
    }

    fetch(url).then(res => res.json()).then(
      (data: ServerDataType) => {
        setInitialGame(data);
        setInitialField(data);
        updateClosestColorCellBorder("1,1");
    });
  };

  const setInitialGame = (initialData: ServerDataType) => {
    setData((prevState) => ({
      ...prevState,
      initial: initialData,
      game: {
        closestColor: [0, 0, 0],
        status: EGameStatus.INITIAL,
        stepCount: 0,
        nextColor: [255, 0, 0], //red color
        movable: false,
      },
    }));
  };

  const setInitialField = (data: ServerDataType) => {
    setCellData(AppUtil.getInitialCellData(data));
  };

  const sourceClickHandler = (cellId: string) => {
    if (data.game?.status === EGameStatus.INITIAL) {
      initialGameProc(cellId);
    }
  };

  const cellDropHandler = (e: DragEvent, sourceCellId: string) => {
    const tileCellId = e.dataTransfer?.getData("id") as string;
    if (data.game?.status === EGameStatus.PROGRESS) {
      updateGameProgress(tileCellId, sourceCellId);
    }
  };

  const setMovable = (movable: boolean) => {
    setCellData((prevState) => {
      const updatedField = AppUtil.cloneCellData(prevState);
      for (let y = 0; y <= (data.initial?.height as number) + 1; y++) {
        for (let x = 0; x <= (data.initial?.width as number) + 1; x++) {
          if (updatedField[y][x].type !== ECellType.EMPTY) {
            updatedField[y][x] = {
              ...updatedField[y][x],
              movable: movable,
            };
          }
        }
      }
      return updatedField;
    });
  };

  const initialGameProc = (cellId: string) => {
    if (typeof data.game?.stepCount !== "undefined") {
      const stepCount = data.game.stepCount;
      drawCellsLines(cellId, data.game?.nextColor);
      //update next cell
      switch (stepCount) {
        case 0:
          setData(
            (prevState): DataType => ({
              ...prevState,
              game: {
                ...(prevState.game as GameDataType),
                nextColor: [0, 255, 0], // green
              },
            })
          );
          break;
        case 2:
        default:
          setData(
            (prevState): DataType => ({
              ...prevState,
              game: {
                ...(prevState.game as GameDataType),
                nextColor: [0, 0, 255], // blue
              },
            })
          );
      }

      // Check whether a game status need to be changed
      if (stepCount === AppUtil.envVar.initialStepCount - 1) {
        setData((prevState) => ({
          ...prevState,
          game: {
            ...(prevState.game as GameDataType),
            status: EGameStatus.PROGRESS,
          },
        }));

        setMovable(true);
      }
      setStepCount(stepCount);
    }
  };

  const setStepCount = (stepCount: number) => {
    setData((prevState) => ({
      ...prevState,
      game: {
        ...(prevState.game as GameDataType),
        stepCount: stepCount + 1,
      },
    }));
  };

  const drawCellsLines = (cellId: string, cellColor: number[]) => {
    setCellData((prevState) => {
      const coord = AppUtil.getParsedCellId(cellId);
      const updatedField = AppUtil.cloneCellData(prevState);

      updatedField[coord.y][coord.x] = {
        ...updatedField[coord.y][coord.x],
        color: cellColor,
      };

      return AppUtil.getUpdatedCellBorderColor(data, cellId, updatedField);
    });
  };

  const updateGameProgress = (tileCellId: string, sourceCellId: string) => {
    if (typeof data.game?.stepCount !== "undefined") {
      const stepCount = data.game.stepCount;
      const tileColor = AppUtil.getCellColorByCellId(cellData, tileCellId);
      drawCellsLines(sourceCellId, tileColor);
      setStepCount(stepCount);
      isGameOver(stepCount + 1);
    }
  };

  const confirmationHandler = () => {
    fetchInitialData();
  };

  const confirmCloseHandler = () => {
    setConfirmMessage("");
  };

  return (
    <>
      <Info data={data} delta={delta} />
      <GameContainer
        data={data}
        field={cellData}
        sourceClickHandler={sourceClickHandler}
        cellDropHandler={cellDropHandler}
      />
      {confirmMessage && (
          <ConfirmationBox message={confirmMessage} confirmHandler={confirmationHandler} closeHandler={confirmCloseHandler} />
      )}
      
    </>
  );
};

export default Game;