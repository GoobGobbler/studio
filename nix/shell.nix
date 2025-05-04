# nix/shell.nix
# Placeholder Nix flake configuration for RetroIDE development environments
# This defines reproducible shells with specific language runtimes and tools.

{
  description = "Development shells for RetroIDE";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable"; # Or a specific stable release
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        # --- Common Build Inputs ---
        commonInputs = with pkgs; [
          nodejs_20 # Node.js version used for frontend/backend services
          nodePackages.npm # Or yarn, pnpm
          docker # For building/running containers locally
          docker-compose
          git # For version control integration

          # Genkit / AI related
          ollama # If running locally

          # Optional: Linters/Formatters
          # nodePackages.eslint
          # nodePackages.prettier
          # python3Packages.black
          # goPackages.goimports
        ];

        # --- Language Specific Shells ---

        # Example: Python Shell
        pythonShell = pkgs.mkShell {
          name = "retroide-python-shell";
          buildInputs = commonInputs ++ (with pkgs; [
            python311 # Specific Python version
            python311Packages.pip
            # Add common Python tools
            python311Packages.requests
            python311Packages.pytest
          ]);
          # Environment variables specific to this shell
          shellHook = ''
            echo "Entered Python 3.11 development shell."
            # Example: Set PYTHONPATH or other env vars
            # export PYTHONPATH="$PWD/src:$PYTHONPATH"
            pip install --upgrade pip # Ensure pip is up-to-date
            # Consider using requirements.txt or pyproject.toml here
            # if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
          '';
        };

        # Example: Go Shell
        goShell = pkgs.mkShell {
          name = "retroide-go-shell";
          buildInputs = commonInputs ++ (with pkgs; [
            go_1_22 # Specific Go version
            gotools # Go tools (gopls, etc.)
            gopkgs # Additional Go packages if needed
          ]);
          shellHook = ''
            echo "Entered Go 1.22 development shell."
            # Example: Set GOPATH or other env vars if not using modules
            # export GOPATH="$PWD/go"
          '';
        };

        # Example: Rust Shell
        rustShell = pkgs.mkShell {
          name = "retroide-rust-shell";
          buildInputs = commonInputs ++ (with pkgs; [
            rustup # Manages Rust toolchains
            cargo # Rust package manager
            # Add linters/formatters
            clippy
            rustfmt
          ]);
          shellHook = ''
            echo "Entered Rust development shell."
            # Ensure default toolchain is installed if needed
            # rustup toolchain install stable --profile minimal
            # rustup default stable
          '';
        };

        # Add shells for other languages (Java, Ruby, PHP, C++, etc.)
        # javaShell = pkgs.mkShell { ... };
        # rubyShell = pkgs.mkShell { ... };
        # phpShell = pkgs.mkShell { ... };

        # --- Default Development Shell (Node.js focused) ---
        devShell = pkgs.mkShell {
          name = "retroide-default-shell";
          buildInputs = commonInputs ++ (with pkgs; [
            # Add any other default tools needed
            jq # Useful JSON processor
          ]);
          shellHook = ''
            echo "Entered default RetroIDE development shell (Node.js focus)."
            # Check versions or perform setup
            node --version
            npm --version
          '';
        };

      in
      {
        # Expose shells to be used via `nix develop .#<shellName>`
        devShells = {
          default = devShell;
          python = pythonShell;
          go = goShell;
          rust = rustShell;
          # java = javaShell;
          # ruby = rubyShell;
          # php = phpShell;
        };

        # Default shell when running `nix develop`
        devShell = devShell;

        # Optional: Expose packages or apps if needed
        # packages.default = ...;
        # apps.default = ...;
      }
    );
}
