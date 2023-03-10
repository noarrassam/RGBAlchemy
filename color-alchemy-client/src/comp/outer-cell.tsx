import React, { DragEvent, FC } from "react";
import { EGameStatus } from "../util/enums";
import { CellPropsType } from "../util/types";




const OuterCell: FC<CellPropsType> = (props) => {

  const handleSourceClick = () => {
    props.sourceClickHandler(props.id);
  };

  const handleDragOver = (event: DragEvent) => {
    if (props.movable) {
      event.preventDefault();
    }
  };

  const handleDrop = (event: DragEvent) => {
    if (props.movable) {
      props.cellDropHandler(event, props.id);
    }
  };

  const getStyle = () => {
    const {color} = props;
    const backgroundColor: string = `rgb(${color?.[0] || 0}, ${color?.[1] || 0
    }, ${color?.[2] || 0})`;
    const cursor: string = (props.gameStatus === EGameStatus.INITIAL) ? "pointer" : "";
    const style = {backgroundColor: backgroundColor,cursor: cursor};
    return style;
}

const getTitle = () => {
    let arrTitle: string[] = props.color.map((color: number) => {
        return color.toFixed(0);
    });
    return `rgb(${arrTitle.join(',')})`;
}

  return (
    <div id={props.id} className="game-cell outer-cell" style={getStyle()}
      title={getTitle()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleSourceClick}
    />
  );
};

export default OuterCell;