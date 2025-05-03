# Use a standard Node.js image for smoother dev setup
FROM node:18

LABEL name="Angular dev environment" \
      description="This image can be used to create a dev environment for building Angular." \
      vendor="angular" \
      version="1.0"

EXPOSE 4200

# Install Angular CLI globally
RUN npm i -g @angular/cli

RUN echo export NODE_OPTIONS="--max-old-space-size=8192" >> /root/.bashrc
RUN echo export NODE_OPTIONS="--max-old-space-size=8192" >> /root/.bash_profile
RUN echo export NODE_OPTIONS="--max-old-space-size=8192" >> /root/.profile

RUN apt-get update && apt-get install -y procps && \
    echo fs.inotify.max_user_watches=524288 >> /etc/sysctl.conf && \
    sysctl -p

# Default command to keep the container alive
CMD ["tail", "-f", "/dev/null"]
