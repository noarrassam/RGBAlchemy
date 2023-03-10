import React, { DragEvent, FC } from "react";
import { InnerCellPropsType } from "../util/types";


const InnerCell: FC<InnerCellPropsType> = (props) => {

    const dragStartHandler = (event: DragEvent) => {
        if(props.movable) {
            event.dataTransfer?.setData("id", props.id);
        }
    };

    const getStyle = () => {
        const {color,borderColor,movable} = props;
        const backgroundColor: string = `rgb(${color?.[0] || 0}, ${color?.[1] || 0
        }, ${color?.[2] || 0})`;
        const borderColorStyle: string = `rgb(${borderColor?.[0] || 0}, ${borderColor?.[1] || 0
        }, ${borderColor?.[2] || 0})`;
        const cursor: string = movable ? "pointer" : "";
        const style = {backgroundColor: backgroundColor,borderColor: borderColorStyle,cursor: cursor};
        return style;
    }

    const getTitle = () => {
        let arrTitle: string[] = props.color.map((color: number) => {
            return color.toFixed(0);
        });
        return `rgb(${arrTitle.join(',')})`;
    }

    return (
            <div id={props.id} className="game-cell inner-cell" style={getStyle()}
                title={getTitle()}
                onDragStart={dragStartHandler}
                draggable={props.movable}
            />
    );
};

export default InnerCell;