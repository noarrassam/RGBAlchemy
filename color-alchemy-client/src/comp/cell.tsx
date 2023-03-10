import React, { FC } from "react";
import OuterCell from "./outer-cell";
import InnerCell from "./inner-cell";
import { CellPropsType } from "../util/types";
import { ECellType } from "../util/enums";
import EmptyCell from "./empty-cell";

const Cell: FC<CellPropsType> = (props) => {
  return (
    <>
      {(props.type === ECellType.INNER) && (<InnerCell {...props} />)}
      {(props.type === ECellType.OUTER) && (<OuterCell {...props} gameStatus={props.gameStatus} sourceClickHandler={props.sourceClickHandler} cellDropHandler={props.cellDropHandler}  />)}
      {(props.type === ECellType.EMPTY) && (<EmptyCell />)}
    </>
  );
};

export default Cell;
