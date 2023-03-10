import React, { FC } from "react";
import { AppUtil } from "../util/appUtil";
import { ECellType } from "../util/enums";
import { CellDataType, InfoBoxProps } from "../util/types";
import InnerCell from "./inner-cell";


const Info: FC<InfoBoxProps> = (props) => {
  const targetCell: CellDataType = {
    id: "0",
    color: props.data.initial?.target || [0, 0, 0],
    borderColor: AppUtil.envVar.borderColor,
    type: ECellType.EMPTY,
    movable: false,
  };

  const closestCell: CellDataType = {
    id: "1",
    color: props.data.game?.closestColor || [0, 0, 0],
    borderColor: AppUtil.envVar.borderColor,
    type: ECellType.EMPTY,
    movable: false,
  };

  return (
    <div className="info-con">
      <div className="info-label">
        <h2>RGB Alchemy</h2>
      </div>
      <div className="info-label">User ID: {props.data.initial?.userId}</div>
      <div className="info-label">
        Moves left:{" "}
        {(props.data.initial?.maxMoves as number) -
          (props.data.game?.stepCount as number)}
      </div>
      <div className="info-target"> Target color: &nbsp; <InnerCell {...targetCell} /> </div>
      <div className="info-target"> Closest color: &nbsp; <InnerCell {...closestCell} /> 
        &nbsp;&nbsp;&nbsp;&nbsp; 
        <span>&Delta; {props.delta.toFixed(2)}%</span>
      </div>
    </div>
  );
};

export default Info;