FROM node:24

# Install basic development tools
RUN apt update && apt install -y less man-db sudo lsb-release

# Ensure default `node` user has access to `sudo`
ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Install azure cli
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install azure function tools
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
RUN sudo mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg
RUN sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/debian/$(lsb_release -rs 2>/dev/null | cut -d'.' -f 1)/prod $(lsb_release -cs 2>/dev/null) main" > /etc/apt/sources.list.d/dotnetdev.list'
RUN apt update && apt install -y azure-functions-core-tools-4

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true

USER node

# Set line endings
RUN git config --global core.autocrlf true
