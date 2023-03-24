import Instabot from '../core/Instabot';
import { Logger } from '../utils/Logger';

import type { TCommentServiceArgs, TCommentServiceExecuteArgs } from '../shared/types/comment.type';

export class CommentService {
  private logger: Logger = new Logger(CommentService.name);

  public constructor(private commentArgs: TCommentServiceArgs) {
    this.logger.info(`Starting...`);
  }

  public async execute(args: TCommentServiceExecuteArgs): Promise<void> {
    const { loginInstagram, passwordInstagram } = this.commentArgs;
    const { link, author } = args;
    const instabot = new Instabot({ ...this.commentArgs, loginInstagram, passwordInstagram });
    if (args.mode) {
      instabot.setMode = args.mode;
    }
    try {
      await instabot.comment({ link, author: author || 'Jesus', mode: args.mode });
    } catch (error) {
      this.logger.error(JSON.stringify(error));
    }
  }
}
