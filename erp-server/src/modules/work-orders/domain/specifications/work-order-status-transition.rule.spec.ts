import { WorkOrderStatusTransitionRule } from './work-order-status-transition.rule';
import { WorkOrderStatus } from '../enums/work-order-status.enum';
import { DomainException } from '../../../../common/exceptions/domain.exception';

describe('WorkOrderStatusTransitionRule', () => {
  describe('isSatisfiedBy', () => {
    it('should return true for valid transitions', () => {
      expect(
        WorkOrderStatusTransitionRule.isSatisfiedBy(
          WorkOrderStatus.PLANNED,
          WorkOrderStatus.ASSIGNED,
        ),
      ).toBe(true);
      expect(
        WorkOrderStatusTransitionRule.isSatisfiedBy(
          WorkOrderStatus.ASSIGNED,
          WorkOrderStatus.IN_PROGRESS,
        ),
      ).toBe(true);
      expect(
        WorkOrderStatusTransitionRule.isSatisfiedBy(
          WorkOrderStatus.IN_PROGRESS,
          WorkOrderStatus.QUALITY_CHECK,
        ),
      ).toBe(true);
      expect(
        WorkOrderStatusTransitionRule.isSatisfiedBy(
          WorkOrderStatus.QUALITY_CHECK,
          WorkOrderStatus.COMPLETED,
        ),
      ).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(
        WorkOrderStatusTransitionRule.isSatisfiedBy(
          WorkOrderStatus.PLANNED,
          WorkOrderStatus.COMPLETED,
        ),
      ).toBe(false);
    });
  });

  describe('assertSatisfied', () => {
    it('should not throw for valid transitions', () => {
      expect(() =>
        WorkOrderStatusTransitionRule.assertSatisfied(
          WorkOrderStatus.PLANNED,
          WorkOrderStatus.ASSIGNED,
        ),
      ).not.toThrow();
    });

    it('should throw DomainException for invalid transitions', () => {
      expect(() =>
        WorkOrderStatusTransitionRule.assertSatisfied(
          WorkOrderStatus.PLANNED,
          WorkOrderStatus.COMPLETED,
        ),
      ).toThrow(DomainException);
    });
  });
});