import { ZodValidationPipe } from './zod-validation.pipe';
import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

describe('ZodValidationPipe', () => {
  const schema = z.object({ name: z.string().min(2) });
  const pipe = new ZodValidationPipe(schema);
  const meta = { type: 'body' as const, metatype: undefined, data: undefined };

  it('returns parsed value when input is valid', () => {
    expect(pipe.transform({ name: 'Aisha' }, meta)).toEqual({ name: 'Aisha' });
  });

  it('throws BadRequestException with structured errors on invalid input', () => {
    try {
      pipe.transform({ name: 'A' }, meta);
      fail('expected BadRequestException');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      const body = (err as BadRequestException).getResponse() as { errors: { path: string }[] };
      expect(body.errors[0].path).toBe('name');
    }
  });

  it('rejects non-object input gracefully', () => {
    expect(() => pipe.transform(null, meta)).toThrow(BadRequestException);
  });
});
