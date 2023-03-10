import { DragEvent } from "react";

type EnvDataType = {
    serverUrl: string;
    initEndPoint: string;
    userEndPoint: string;
    initialStepCount: number;
    borderColor: number[];
    closestColorBorder: number[];
    delta: number;
    deltaWinCondition: number;
}

type ServerDataType = {
  userId: string;
  width: number;
  height: number;
  maxMoves: number;
  target: number[];
}

type DataType = {
  initial?: ServerDataType;
  game?: GameDataType;
}

type InfoBoxProps = {
  data: DataType;
  delta: number;
}

type CellDataType = {
  id: string;
  color: number[];
  borderColor: number[];
  type: ICellType;
  movable: boolean;
}

type InnerCellPropsType =  CellDataType & {
 
}

type CellPropsType = CellDataType & {
  gameStatus?: EGameStatus;
  sourceClickHandler: (cellId: string) => void;
  cellDropHandler: (e: DragEvent, cellId: string) => void;
}

type GameDataType = {
  closestColor: number[];
  status: EGameStatus;
  stepCount: number;
  nextColor: number[];
  movable: boolean;
}

type GridContainerProps = {
  data: DataType;
  field: CellDataType[][];
  sourceClickHandler: (cellId: string) => void;
  cellDropHandler: (e: DragEvent, cellId: string) => void;
}

type ConfirmationBoxProps = {
  message: string;
  confirmHandler: () => void;
  closeHandler: () => void;
}




