import { Component, lazy, Suspense, type ComponentProps, type ReactNode } from "react";

const Anatomy3D = lazy(() => import("./Anatomy3D"));

/** Falls back to the 2D chart if WebGL or the model fails. */
class Guard extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export const Anatomy3DLazy: React.FC<ComponentProps<typeof Anatomy3D> & { fallback: ReactNode }> = ({ fallback, ...props }) => (
  <Guard fallback={fallback}>
    <Suspense fallback={<div className="a3d-loading">載入 3D 解剖模型…</div>}>
      <Anatomy3D {...props} />
    </Suspense>
  </Guard>
);

export const ANATOMY_CREDIT = "3D 模型：Z-Anatomy（CC BY-SA 4.0），部分衍生自 BodyParts3D（CC BY-SA 2.1 JP）";
