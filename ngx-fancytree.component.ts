import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';

declare var jQuery: any;

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
    autoExpandMS: 400,
    focusOnClick: true,
    preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
    preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
    dragStart: (node, data) => {
      /** This function MUST be defined to enable dragging for the tree.
       *  Return false to cancel dragging of node.
       */
      return true;
    },
    dragEnter: (node, data) => {
      /** data.otherNode may be null for non-fancytree droppables.
       *  Return false to disallow dropping on node. In this case
       *  dragOver and dragLeave are not called.
       *  Return 'over', 'before, or 'after' to force a hitMode.
       *  Return ['before', 'after'] to restrict available hitModes.
       *  Any other return value will calc the hitMode from the cursor position.
       */
      // Prevent dropping a parent below another parent (only sort
      // nodes under the same parent)
/*           if(node.parent !== data.otherNode.parent){
        return false;
      }
      // Don't allow dropping *over* a node (would create a child)
      return ["before", "after"];
*/
       return true;
    },
    dragDrop: (node, data) => {
      /** This function MUST be defined to enable dropping of items on
       *  the tree.
       */
      data.otherNode.moveTo(node, data.hitMode);
      if (this.callback) {
        this.callback('dnd\'d: ' + data.otherNode.title);
      }
    }
  };

  public ngAfterViewInit() {
    $(this.tree.nativeElement).fancytree({
      source: this.nodes,
      extensions: this.options.extensions.filter(
          (extension) => extension.active === true
        ).map((extension) => extension.name),
      dnd: this.dndSettings,
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

    $(document).contextmenu({
      selector: "#tree span.fancytree-title",
      delegate: ".hasmenu",
      items: {
        "cut": {name: "Cut", icon: "cut",
            callback: function(key, opt){
              var node = $.ui.fancytree.getNode(opt.$trigger);
              alert("Clicked on " + key + " on " + node);
            }
          },
        "copy": {name: "Copy", icon: "copy"},
        "paste": {name: "Paste", icon: "paste", disabled: false },
        "sep1": "----",
        "edit": {name: "Edit", icon: "edit", disabled: true },
        "delete": {name: "Delete", icon: "delete", disabled: true },
        "more": {name: "More", items: {
          "sub1": {name: "Sub 1"},
          "sub1": {name: "Sub 2"}
          }}
        },
      callback: function(itemKey, opt) {
        var node = $.ui.fancytree.getNode(opt.$trigger);
        alert("select " + itemKey + " on " + node);
      }
    });
  }

}
