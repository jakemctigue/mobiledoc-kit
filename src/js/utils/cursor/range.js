import Position from './position';
import { DIRECTION } from '../key';

export default class Range {
  /**
   * A logical range of a {@link Post}.
   * Usually an instance of Range will be read from the {@link Editor#range} property,
   * but it may be useful to instantiate a range directly in cases
   * when programmatically modifying a Post.
   * @constructor
   * @param {Position} head
   * @param {Position} [tail=head]
   * @param {Direction} [direction=null]
   * @return {Range}
   */
  constructor(head, tail=head, direction=null) {
    /** @property {Position} head */
    this.head = head;

    /** @property {Position} tail */
    this.tail = tail;

    /** @property {Direction} direction */
    this.direction = direction;
  }

  /**
   * Shorthand to create a new range from a section(s) and offset(s).
   * When given only a head section and offset, creates a collapsed range.
   * @param {Section} headSection
   * @param {number} headOffset
   * @param {Section} [tailSection=headSection]
   * @param {number} [tailOffset=headOffset]
   * @param {Direction} [direction=null]
   * @return {Range}
   */
  static create(headSection, headOffset, tailSection=headSection, tailOffset=headOffset, direction=null) {
    return new Range(
      new Position(headSection, headOffset),
      new Position(tailSection, tailOffset),
      direction
    );
  }

  static fromSection(section) {
    return new Range(section.headPosition(), section.tailPosition());
  }

  static blankRange() {
    return new Range(Position.blankPosition(), Position.blankPosition());
  }

  /**
   * @param {Markerable} section
   * @return {Range} A range that is constrained to only the part that
   * includes the section.
   * FIXME -- if the section isn't the head or tail, it's assumed to be
   * wholly contained. It's possible to call `trimTo` with a selection that is
   * outside of the range, though, which would invalidate that assumption.
   * There's no efficient way to determine if a section is within a range, yet.
   * @private
   */
  trimTo(section) {
    const length = section.length;

    let headOffset = section === this.head.section ?
      Math.min(this.head.offset, length) : 0;
    let tailOffset = section === this.tail.section ?
      Math.min(this.tail.offset, length) : length;

    return Range.create(section, headOffset, section, tailOffset);
  }

  /**
   * Expands the range 1 unit in the given direction
   * @param {Direction} direction
   * @return {Range} If the range is expandable in the given direction, always returns a
   *         non-collapsed range.
   * @public
   */
  extend(direction) {
    let { head, tail, direction: currentDirection } = this;
    switch (currentDirection) {
      case DIRECTION.FORWARD:
        return new Range(head, tail.move(direction), currentDirection);
      case DIRECTION.BACKWARD:
        return new Range(head.move(direction), tail, currentDirection);
      default:
        return new Range(head, tail, direction).extend(direction);
    }
  }

  /**
   * Moves this range 1 unit in the given direction.
   * If the range is collapsed, returns a collapsed range shifted by 1 unit,
   * otherwise collapses this range to the position at the `direction` end of the range.
   * @param {Direction} direction
   * @return {Range} Always returns a collapsed range
   * @public
   */
  move(direction) {
    let { focusedPosition, isCollapsed } = this;

    if (isCollapsed) {
      return new Range(focusedPosition.move(direction));
    } else {
      return this._collapse(direction);
    }
  }

  _collapse(direction) {
    return new Range(direction === DIRECTION.BACKWARD ? this.head : this.tail);
  }

  get focusedPosition() {
    return this.direction === DIRECTION.BACKWARD ? this.head : this.tail;
  }

  isEqual(other) {
    return other &&
      this.head.isEqual(other.head) &&
      this.tail.isEqual(other.tail);
  }

  get isBlank() {
    return this.head.isBlank && this.tail.isBlank;
  }

  // "legacy" APIs
  get headSection() {
    return this.head.section;
  }
  get tailSection() {
    return this.tail.section;
  }
  get headSectionOffset() {
    return this.head.offset;
  }
  get tailSectionOffset() {
    return this.tail.offset;
  }
  get isCollapsed() {
    return this.head.isEqual(this.tail);
  }
  get headMarker() {
    return this.head.marker;
  }
  get tailMarker() {
    return this.tail.marker;
  }
  get headMarkerOffset() {
    return this.head.offsetInMarker;
  }
  get tailMarkerOffset() {
    return this.tail.offsetInMarker;
  }
}
