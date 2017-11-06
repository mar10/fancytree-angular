import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';

import 'jquery.fancytree';
import 'jquery.fancytree/dist/modules/jquery.fancytree.dnd5.js';
import 'jquery.fancytree/dist/modules/jquery.fancytree.edit.js';
import 'jquery';
import 'jquery-ui-dist/jquery-ui.min.js';

@Component({
  selector: 'fancytree',
  styleUrls: [ './ngx-fancytree.component.scss' ],
  template: `
    <div #tree></div>
  `
})
export class FancyTreeComponent implements AfterViewInit {

  @ViewChild('tree') public tree: ElementRef;
  @Input() public nodes;
  @Input() public options;
  @Input() public lazyLoad;
  @Input() public callback;

  private dndSettings = {
    autoExpandMS: 1500,
    preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
    preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.

    // --- Drag Support --------------------------------------------------------

    dragStart: function(node, data) {
      // Called when user starts dragging `node`.
      // This method MUST be defined to enable dragging for tree nodes.
      //
      // We can
      //   Add or modify the drag data using `data.dataTransfer.setData()`
      //   Return false to cancel dragging of `node`.

      // For example:
//    if( data.originalEvent.shiftKey ) ...
//    if( node.isFolder() ) { return false; }
      return true;
    },
    dragDrag: function(node, data) {
      // Called every few microseconds while `node` is dragged.
      // Implementation of this callback is optional and rarely required.
    },
    dragEnd: function(node, data) {
      // Called when the drag operation has terminated.
      // Check `data.isCancelled` to see if a drop ocurred.
      // Implementation of this callback is optional and rarely required.
    },

    // --- Drop Support --------------------------------------------------------

    dragEnter: function(node, data) {
      // Called when s.th. is dragged over `node`.
      // `data.otherNode` may be null for non-fancytree droppables.
      //
      // We may
      //   Set `data.dataTransfer.effectAllowed` and `.dropEffect`
      //   Call `data.dataTransfer.setDragImage()`
      //
      // Return
      //   - false to prevent dropping (dragOver and dragLeave are not called)
      //   - a list (e.g. ["before", "after"]) to restrict available hitModes
      //   - "over", "before, or "after" to force a hitMode
      //   - Any other return value will calc the hitMode from the cursor position.

      // Example:
      // Prevent dropping a parent below another parent (only sort nodes under
      // the same parent):
//    if(node.parent !== data.otherNode.parent){
//      return false;
//    }
      // Example:
      // Don't allow dropping *over* a node (which would create a child). Just
      // allow changing the order:
//    return ["before", "after"];
      // Accept everything:
      return true;
    },
    dragOver: function(node, data) {
      // Called every while s.th. is dragged over `node`.
      // `data.hitMode` contains the calculated insertion point, based on cursor
      // position and the response of `dragEnter`.
      //
      // We may
      //   Override `data.hitMode`
      //   Set `data.dataTransfer.effectAllowed` and `.dropEffect`
      //   Call `data.dataTransfer.setDragImage()`
    },
    dragExpand: function(node, data) {
      // Called when a dragging cursor lingers over a parent node.
      // (Optional) Return false to prevent auto-expanding `node`.
    },
    dragLeave: function(node, data) {
      // Called when s.th. is no longer dragged over `node`.
      // Implementation of this callback is optional and rarely required.
    },
    dragDrop: function(node, data) {
      // This function MUST be defined to enable dropping of items on the tree.
      //
      // The source data is provided in several formats:
      //   `data.otherNode` (null if it's not a FancytreeNode from the same page)
      //   `data.otherNodeData` (Json object; null if it's not a FancytreeNode)
      //   `data.dataTransfer.getData()`
      //
      // We may access some meta data to decide what to do:
      //   `data.hitMode` ("before", "after", or "over").
      //   `data.dataTransfer.dropEffect`,`.effectAllowed`
      //   `data.originalEvent.shiftKey`, ...
      //
      // Example:

      var transfer = data.dataTransfer;

      node.debug("drop", data);

      if( data.otherNode ) {
        // Drop another Fancytree node from same frame
        // (maybe from another tree however)
        var sameTree = (data.otherNode.tree === data.tree);

        data.otherNode.moveTo(node, data.hitMode);
      } else if( data.otherNodeData ) {
        // Drop Fancytree node from different frame or window, so we only have
        // JSON representation available
        node.addChild(data.otherNodeData, data.hitMode);
      } else {
        // Drop a non-node
        node.addNode({
          title: transfer.getData("text")
        }, data.hitMode);
      }
      // Expand target node when a child was created:
      node.setExpanded();
    }
  };

  public ngAfterViewInit() {
    $(this.tree.nativeElement).fancytree({
      source: this.nodes,
      extensions: this.options.extensions.filter(
          (extension) => extension.active === true
        ).map((extension) => extension.name),
      dnd5: this.dndSettings,
      activate: (event, data) => {
        console.log(data.node.title);
      // },
      // lazyLoad: (event, data) => {
      //   const dfd = new $.Deferred();
      //   data.result = dfd.promise();
      //   this.lazyLoad().subscribe((dat) => {
      //     console.log(dat);
      //     dfd.resolve(dat);
      //   });
      }
    });
  }

}
