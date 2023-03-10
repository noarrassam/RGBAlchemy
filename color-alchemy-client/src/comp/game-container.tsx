import { FC } from "react";
import { GridContainerProps } from "../util/types";
import Cell from "./cell";

const GameContainer: FC<GridContainerProps> = (props) => {
  const getStyleForCon = () => {
    const col = props?.data?.initial?.width ? props.data.initial.width + 2 : 0
    const style = {gridTemplateColumns: `repeat(${col}, 1fr)`};
    return style;
  }
  return (
    <>
      {props?.data?.initial?.width && (
        <div className="game-container" style={getStyleForCon()}>
          {Array.isArray(props.field) &&
            props.field.map((row) => {
              return row.map((cell) => {
                return (
                  <div key={cell.id} className="cell-container">
                    <Cell
                      {...cell}
                      gameStatus={props.data.game?.status}
                      sourceClickHandler={props.sourceClickHandler}
                      cellDropHandler={props.cellDropHandler}
                    />
                  </div>
                );
              });
            })}
        </div>
      )}
    </>
  );
};

export default GameContainer;