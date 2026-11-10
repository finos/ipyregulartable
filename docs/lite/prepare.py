"""Stage existing notebooks for JupyterLite without changing their source files."""

import json
import sys
from pathlib import Path

from jupyter_core.paths import jupyter_path

ROOT = Path(__file__).resolve().parents[2]
LITE = ROOT / "docs" / "lite"


def main():
    extensions = []
    for name in ("@jupyterlite/pyodide-kernel-extension", "@jupyter-widgets/jupyterlab-manager", "anywidget"):
        for base in [Path(sys.prefix) / "share/jupyter/labextensions", *map(Path, jupyter_path("labextensions"))]:
            candidate = base / name
            if (candidate / "package.json").is_file():
                if not candidate.resolve().is_relative_to(Path(sys.prefix).resolve()):
                    extensions.append(str(candidate.resolve()))
                break
        else:
            raise RuntimeError(f"Missing JupyterLab extension: {name}. Install the lite extra.")

    config = {"LiteBuildConfig": {"apps": ["lab", "tree"], "no_sourcemaps": True, "federated_extensions": extensions}}
    (LITE / "jupyter_lite_config.json").write_text(json.dumps(config, indent=2) + "\n")
    contents = LITE / "files"
    contents.mkdir(parents=True, exist_ok=True)
    for path in sorted((ROOT / "docs" / "examples").glob("*.ipynb")):
        notebook = json.loads(path.read_text())
        notebook["nbformat_minor"] = max(notebook["nbformat_minor"], 5)
        for index, cell in enumerate(notebook["cells"]):
            cell.setdefault("id", f"example-{index}")
            if cell["cell_type"] == "code":
                cell["execution_count"] = None
                cell["outputs"] = []
        notebook["cells"].insert(
            0,
            {
                "cell_type": "code",
                "execution_count": None,
                "id": "ipyregulartable-install",
                "metadata": {},
                "outputs": [],
                "source": [
                    "%pip install -q ipyregulartable\n",
                    "from importlib.metadata import version\n",
                    "print('ipyregulartable', version('ipyregulartable'))",
                ],
            },
        )
        notebook.setdefault("metadata", {})["kernelspec"] = {
            "display_name": "Python (Pyodide)",
            "language": "python",
            "name": "python",
        }
        notebook["metadata"].pop("widgets", None)
        (contents / path.name).write_text(json.dumps(notebook, indent=1, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
